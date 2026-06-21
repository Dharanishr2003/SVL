package com.nexorcrm.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.nexorcrm.backend.dto.PayrollRunRequest;
import com.nexorcrm.backend.dto.PayslipResponse;
import com.nexorcrm.backend.entity.*;
import com.nexorcrm.backend.repo.*;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.List;

@Service
@Transactional
public class PayrollService {

    private static final Logger log = LoggerFactory.getLogger(PayrollService.class);

    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;
    private final PayslipRepository payslipRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;
    private final PayrollOvertimeRepository overtimeRepository;
    private final MailSettingsService mailSettingsService;
    private final JavaMailSender defaultMailSender;
    private final PayslipService payslipService;
    private final EmailTemplateRepository emailTemplateRepository;

    public PayrollService(EmployeeRepository employeeRepository,
                          EmployeeSalaryRepository employeeSalaryRepository,
                          PayslipRepository payslipRepository,
                          AttendanceRepository attendanceRepository,
                          LeaveRepository leaveRepository,
                          UserRepository userRepository,
                          PayrollOvertimeRepository overtimeRepository,
                          MailSettingsService mailSettingsService,
                          JavaMailSender defaultMailSender,
                          PayslipService payslipService,
                          EmailTemplateRepository emailTemplateRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeSalaryRepository = employeeSalaryRepository;
        this.payslipRepository = payslipRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
        this.overtimeRepository = overtimeRepository;
        this.mailSettingsService = mailSettingsService;
        this.defaultMailSender = defaultMailSender;
        this.payslipService = payslipService;
        this.emailTemplateRepository = emailTemplateRepository;
    }

    public List<PayslipResponse> runPayroll(PayrollRunRequest request) {
        String monthStr = request.getMonth();
        LocalDate[] range = parseMonthRange(monthStr);
        LocalDate startDate = range[0];
        LocalDate endDate = range[1];

        // Fetch global overtime percentage (defaults to 150.00%)
        BigDecimal otPercentage = BigDecimal.valueOf(150.00);
        List<PayrollOvertime> overtimes = overtimeRepository.findByDeletedFalseOrderByNameAsc();
        if (!overtimes.isEmpty()) {
            otPercentage = overtimes.get(0).getRate();
        }

        List<Employee> employees = employeeRepository.findByDeletedFalseOrderByIdDesc();
        List<PayslipResponse> responses = new ArrayList<>();

        for (Employee emp : employees) {
            Optional<EmployeeSalary> salaryOpt = employeeSalaryRepository.findByEmployeeIdAndDeletedFalse(emp.getId());
            if (salaryOpt.isEmpty()) {
                continue; // Skip if no salary structure
            }
            EmployeeSalary sal = salaryOpt.get();

            // 1. Calculate Overtime
            BigDecimal overtimeAmount = BigDecimal.ZERO;
            Optional<User> userOpt = userRepository.findByEmployeeIdAndIsDeletedFalse(emp.getId());
            if (userOpt.isPresent()) {
                int totalOtMinutes = attendanceRepository.sumOvertimeMinutesByUserBetween(userOpt.get().getId(), startDate, endDate);
                if (totalOtMinutes > 0) {
                    BigDecimal otHours = BigDecimal.valueOf(totalOtMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
                    
                    // Dynamic OT Hourly Rate: (Basic / 240) * (otPercentage / 100)
                    BigDecimal basic = sal.getBasic() != null ? sal.getBasic() : BigDecimal.ZERO;
                    BigDecimal regularHourlyRate = basic.divide(BigDecimal.valueOf(240), 4, RoundingMode.HALF_UP);
                    BigDecimal otHourlyRate = regularHourlyRate.multiply(otPercentage.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                    
                    overtimeAmount = otHours.multiply(otHourlyRate).setScale(2, RoundingMode.HALF_UP);
                }
            }

            // 2. Calculate Leave Deductions (LOP)
            BigDecimal leaveDeductionAmount = BigDecimal.ZERO;
            List<Leave> leaves = leaveRepository.findByEmployeeIdAndDeletedFalseOrderByFromDateDesc(emp.getId());
            BigDecimal totalLopDays = BigDecimal.ZERO;
            for (Leave leave : leaves) {
                if ("APPROVED".equalsIgnoreCase(leave.getStatus())) {
                    LocalDate lStart = leave.getFromDate();
                    LocalDate lEnd = leave.getToDate();
                    if (lStart.isBefore(endDate.plusDays(1)) && lEnd.isAfter(startDate.minusDays(1))) {
                        LocalDate overlapStart = lStart.isBefore(startDate) ? startDate : lStart;
                        LocalDate overlapEnd = lEnd.isAfter(endDate) ? endDate : lEnd;
                        long overlapDays = ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
                        String type = leave.getLeaveType() != null ? leave.getLeaveType().toLowerCase() : "";
                        if (type.contains("lop") || type.contains("unpaid") || type.contains("loss of pay")) {
                            BigDecimal days = leave.getNoOfDays() != null ? leave.getNoOfDays() : BigDecimal.ZERO;
                            long totalLeaveDays = ChronoUnit.DAYS.between(lStart, lEnd) + 1;
                            if (totalLeaveDays > 0) {
                                double prop = (double) overlapDays / totalLeaveDays;
                                totalLopDays = totalLopDays.add(days.multiply(BigDecimal.valueOf(prop)));
                            }
                        }
                    }
                }
            }

            if (totalLopDays.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal basic = sal.getBasic() != null ? sal.getBasic() : BigDecimal.ZERO;
                BigDecimal dailyRate = basic.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
                leaveDeductionAmount = dailyRate.multiply(totalLopDays).setScale(2, RoundingMode.HALF_UP);
            }

            // 3. Compute Net Salary
            BigDecimal basic = sal.getBasic() != null ? sal.getBasic() : BigDecimal.ZERO;
            BigDecimal da = sal.getDa() != null ? sal.getDa() : BigDecimal.ZERO;
            BigDecimal hra = sal.getHra() != null ? sal.getHra() : BigDecimal.ZERO;
            BigDecimal conveyance = sal.getConveyance() != null ? sal.getConveyance() : BigDecimal.ZERO;

            BigDecimal grossSalary = basic.add(da).add(hra).add(conveyance).add(overtimeAmount);

            BigDecimal pf = sal.getPf() != null ? sal.getPf() : BigDecimal.ZERO;
            BigDecimal esi = sal.getEsi() != null ? sal.getEsi() : BigDecimal.ZERO;
            BigDecimal tds = sal.getTds() != null ? sal.getTds() : BigDecimal.ZERO;

            BigDecimal totalDeductions = pf.add(esi).add(tds).add(leaveDeductionAmount);
            BigDecimal netSalary = grossSalary.subtract(totalDeductions);
            if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
                netSalary = BigDecimal.ZERO;
            }

            // Check if payslip already exists for this employee + month to avoid duplicates
            // We find any existing non-deleted payslip and update it, or create a new one
            List<Payslip> existingList = payslipRepository.findByMonthAndDeletedFalseOrderByIdDesc(monthStr);
            Payslip p = existingList.stream()
                    .filter(x -> x.getEmployee().getId().equals(emp.getId()))
                    .findFirst()
                    .orElse(new Payslip());

            p.setEmployee(emp);
            p.setEmployeeSalary(sal);
            p.setMonth(monthStr);
            p.setBasic(basic);
            p.setDa(da);
            p.setHra(hra);
            p.setConveyance(conveyance);
            p.setOvertime(overtimeAmount);
            p.setPf(pf);
            p.setEsi(esi);
            p.setTds(tds);
            p.setLeaveDeduction(leaveDeductionAmount);
            p.setNetSalary(netSalary);
            p.setStatus("Generated");
            p.setGeneratedAt(LocalDateTime.now());

            Payslip saved = payslipRepository.save(p);
            responses.add(payslipService.toResponse(saved));
        }

        return responses;
    }

    public List<PayslipResponse> getPayslipsForMonth(String month) {
        return payslipRepository.findByMonthAndDeletedFalseOrderByIdDesc(month)
                .stream().map(payslipService::toResponse).toList();
    }

    public void sendPayslips(PayrollRunRequest request) {
        List<Payslip> payslips = payslipRepository.findByMonthAndDeletedFalseOrderByIdDesc(request.getMonth());
        for (Payslip p : payslips) {
            try {
                sendIndividualPayslipEmail(p);
            } catch (Exception e) {
                log.error("Failed to send payslip email for employee ID: {}", p.getEmployee().getId(), e);
            }
        }
    }

    public void sendPayslipById(Long id) {
        Payslip p = payslipRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found"));
        if (Boolean.TRUE.equals(p.getDeleted())) {
            throw new EntityNotFoundException("Payslip not found");
        }
        try {
            sendIndividualPayslipEmail(p);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private void sendIndividualPayslipEmail(Payslip p) throws Exception {
        Employee emp = p.getEmployee();
        String recipientEmail = emp.getEmail() != null && !emp.getEmail().isBlank()
                ? emp.getEmail()
                : (emp.getOfficialEmail() != null && !emp.getOfficialEmail().isBlank()
                ? emp.getOfficialEmail()
                : emp.getPersonalEmail());

        if (!StringUtils.hasText(recipientEmail)) {
            log.warn("Skipping email for employee {} due to missing email address.", emp.getName());
            return;
        }

        MailSettingsService.ResolvedMailSettings mailSettings = mailSettingsService.resolve();
        boolean mailEnabled = mailSettings != null ? mailSettings.enabled : false; // fallback or configured

        if (mailSettings == null || !mailEnabled) {
            log.warn("Mail is disabled or settings not configured. Cannot send email to {}.", recipientEmail);
            return;
        }

        JavaMailSender sender = buildSender(mailSettings);
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(recipientEmail.trim().toLowerCase());
        
        String fromAddress = mailSettings.fromAddress;
        String fromName = mailSettings.fromName;
        if (StringUtils.hasText(fromAddress)) {
            helper.setFrom(StringUtils.hasText(fromName) ? String.format("%s <%s>", fromName, fromAddress) : fromAddress);
        }

        if (StringUtils.hasText(mailSettings.cc)) {
            helper.setCc(splitEmails(mailSettings.cc));
        }
        if (StringUtils.hasText(mailSettings.bcc)) {
            helper.setBcc(splitEmails(mailSettings.bcc));
        }

        String subject = String.format("Payslip for %s", p.getMonth());
        String body = String.format(
                "Dear %s,\n\n" +
                "We hope you are doing well.\n\n" +
                "Your payslip for the month of %s has been generated and is attached to this email for your reference.\n\n" +
                "Please review the attached document for complete details regarding your earnings, deductions, and net salary.\n\n" +
                "Payslip Details\n\n" +
                "Employee Name: %s\n" +
                "Employee ID: %s\n" +
                "Pay Period: %s\n\n" +
                "If you have any questions regarding your salary or payroll calculations, please contact the HR Department.\n\n" +
                "Thank you.\n\n" +
                "Best Regards,\n" +
                "HR Department\n" +
                "SVL Packaging Printing",
                emp.getName(),
                p.getMonth(),
                emp.getName(),
                emp.getEmployeeCode() != null ? emp.getEmployeeCode() : "N/A",
                p.getMonth()
        );

        Optional<EmailTemplate> templateOpt = emailTemplateRepository.findByTemplateKey("PAYSLIP_EMAIL_TEMPLATE");
        if (templateOpt.isPresent()) {
            EmailTemplate template = templateOpt.get();
            if (!template.isActive()) {
                log.warn("Skipping payslip email dispatch for employee {} because Payslip Email Template is inactive.", emp.getName());
                return;
            }
            if (StringUtils.hasText(template.getSubject())) {
                subject = template.getSubject()
                        .replace("{{month}}", p.getMonth())
                        .replace("{{employee_name}}", emp.getName())
                        .replace("{{employee_code}}", emp.getEmployeeCode() != null ? emp.getEmployeeCode() : "N/A");
            }
            if (StringUtils.hasText(template.getBody())) {
                body = template.getBody()
                        .replace("{{month}}", p.getMonth())
                        .replace("{{employee_name}}", emp.getName())
                        .replace("{{employee_code}}", emp.getEmployeeCode() != null ? emp.getEmployeeCode() : "N/A");
            }
        }

        helper.setSubject(subject);
        helper.setText(body);

        byte[] pdfBytes = generatePayslipPdf(p);
        helper.addAttachment(String.format("Payslip_%s_%s.pdf", p.getMonth().replace(" ", "_"), emp.getName().replace(" ", "_")),
                new org.springframework.core.io.ByteArrayResource(pdfBytes));

        sender.send(message);

        p.setStatus("Sent");
        payslipRepository.save(p);
        log.info("Successfully sent payslip email to {} for {}", recipientEmail, p.getMonth());
    }

    public byte[] getPayslipPdfBytes(Long id) {
        Payslip p = payslipRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found"));
        if (Boolean.TRUE.equals(p.getDeleted())) {
            throw new EntityNotFoundException("Payslip not found");
        }
        try {
            return generatePayslipPdf(p);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    public byte[] generatePayslipPdf(Payslip p) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        Font companyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.BOLD, new java.awt.Color(43, 62, 80));
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Font.NORMAL, new java.awt.Color(100, 110, 120));
        Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new java.awt.Color(43, 62, 80));
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, java.awt.Color.BLACK);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, java.awt.Color.BLACK);
        Font netSalaryFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, new java.awt.Color(43, 62, 80));

        // 1. Header
        Paragraph companyPara = new Paragraph("SVL ENTERPRISES", companyFont);
        companyPara.setAlignment(Element.ALIGN_CENTER);
        doc.add(companyPara);

        Paragraph titlePara = new Paragraph("PAYSLIP - " + p.getMonth().toUpperCase(), titleFont);
        titlePara.setAlignment(Element.ALIGN_CENTER);
        titlePara.setSpacingAfter(20);
        doc.add(titlePara);

        // 2. Employee Details Block
        PdfPTable empTable = new PdfPTable(2);
        empTable.setWidthPercentage(100);
        empTable.setSpacingAfter(20);

        Employee emp = p.getEmployee();
        addMetaCell(empTable, "Employee Code:", emp.getEmployeeCode() != null ? emp.getEmployeeCode() : "N/A", boldFont, normalFont);
        addMetaCell(empTable, "Name:", emp.getName(), boldFont, normalFont);
        addMetaCell(empTable, "Designation:", emp.getDesignation() != null ? emp.getDesignation() : "N/A", boldFont, normalFont);
        addMetaCell(empTable, "Department:", emp.getDepartmentName() != null ? emp.getDepartmentName() : (emp.getDept() != null ? emp.getDept() : "N/A"), boldFont, normalFont);
        addMetaCell(empTable, "Joining Date:", emp.getJoinDate() != null ? emp.getJoinDate().toString() : "N/A", boldFont, normalFont);
        addMetaCell(empTable, "Email:", emp.getEmail() != null ? emp.getEmail() : "N/A", boldFont, normalFont);

        doc.add(empTable);

        // 3. Earnings & Deductions Header Table
        PdfPTable breakdownTable = new PdfPTable(2);
        breakdownTable.setWidthPercentage(100);

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        PdfPTable earningsTable = new PdfPTable(2);
        earningsTable.setWidthPercentage(100);
        earningsTable.setWidths(new float[]{70, 30});

        PdfPCell eHeader = new PdfPCell(new Phrase("EARNINGS", headingFont));
        eHeader.setBackgroundColor(new java.awt.Color(240, 242, 245));
        eHeader.setColspan(2);
        eHeader.setPadding(6);
        eHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
        earningsTable.addCell(eHeader);

        addBreakdownRow(earningsTable, "Basic Salary", p.getBasic(), normalFont);
        addBreakdownRow(earningsTable, "DA (Dearness Allowance)", p.getDa(), normalFont);
        addBreakdownRow(earningsTable, "HRA (House Rent Allowance)", p.getHra(), normalFont);
        addBreakdownRow(earningsTable, "Conveyance", p.getConveyance(), normalFont);
        addBreakdownRow(earningsTable, "Overtime", p.getOvertime(), normalFont);

        BigDecimal totalEarnings = p.getBasic().add(p.getDa()).add(p.getHra()).add(p.getConveyance()).add(p.getOvertime());
        addBreakdownRowBold(earningsTable, "Gross Salary", totalEarnings, boldFont);
        leftCell.addElement(earningsTable);
        breakdownTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPaddingLeft(10);
        PdfPTable deductionsTable = new PdfPTable(2);
        deductionsTable.setWidthPercentage(100);
        deductionsTable.setWidths(new float[]{70, 30});

        PdfPCell dHeader = new PdfPCell(new Phrase("DEDUCTIONS", headingFont));
        dHeader.setBackgroundColor(new java.awt.Color(240, 242, 245));
        dHeader.setColspan(2);
        dHeader.setPadding(6);
        dHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
        deductionsTable.addCell(dHeader);

        addBreakdownRow(deductionsTable, "Provident Fund (PF)", p.getPf(), normalFont);
        addBreakdownRow(deductionsTable, "ESI", p.getEsi(), normalFont);
        addBreakdownRow(deductionsTable, "TDS / Income Tax", p.getTds(), normalFont);
        addBreakdownRow(deductionsTable, "Leave Deduction (LOP)", p.getLeaveDeduction(), normalFont);
        // Filler rows to match heights
        addBreakdownRow(deductionsTable, "-", BigDecimal.ZERO, normalFont);

        BigDecimal totalDeductions = p.getPf().add(p.getEsi()).add(p.getTds()).add(p.getLeaveDeduction());
        addBreakdownRowBold(deductionsTable, "Total Deductions", totalDeductions, boldFont);
        rightCell.addElement(deductionsTable);
        breakdownTable.addCell(rightCell);

        doc.add(breakdownTable);

        // 4. Net Salary Display
        PdfPTable netTable = new PdfPTable(2);
        netTable.setWidthPercentage(100);
        netTable.setSpacingBefore(20);
        netTable.setWidths(new float[]{70, 30});

        PdfPCell netLabelCell = new PdfPCell(new Phrase("NET SALARY (PAID)", netSalaryFont));
        netLabelCell.setBackgroundColor(new java.awt.Color(230, 245, 230));
        netLabelCell.setPadding(8);
        netLabelCell.setBorder(Rectangle.BOX);
        netTable.addCell(netLabelCell);

        PdfPCell netValCell = new PdfPCell(new Phrase("INR " + p.getNetSalary().setScale(2, RoundingMode.HALF_UP).toString(), netSalaryFont));
        netValCell.setBackgroundColor(new java.awt.Color(230, 245, 230));
        netValCell.setPadding(8);
        netValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        netValCell.setBorder(Rectangle.BOX);
        netTable.addCell(netValCell);

        doc.add(netTable);

        // Word Representation
        Paragraph wordsPara = new Paragraph("Amount in words: Rupees " + convertToWords(p.getNetSalary().intValue()) + " Only.", normalFont);
        wordsPara.setSpacingBefore(10);
        wordsPara.setSpacingAfter(40);
        doc.add(wordsPara);

        // Signatures
        PdfPTable signTable = new PdfPTable(2);
        signTable.setWidthPercentage(100);
        PdfPCell employeeSign = new PdfPCell(new Paragraph("_____________________\nEmployee Signature", normalFont));
        employeeSign.setBorder(Rectangle.NO_BORDER);
        employeeSign.setHorizontalAlignment(Element.ALIGN_LEFT);
        signTable.addCell(employeeSign);

        PdfPCell managerSign = new PdfPCell(new Paragraph("_____________________\nAuthorized Signatory", normalFont));
        managerSign.setBorder(Rectangle.NO_BORDER);
        managerSign.setHorizontalAlignment(Element.ALIGN_RIGHT);
        signTable.addCell(managerSign);

        doc.add(signTable);

        doc.close();
        return baos.toByteArray();
    }

    private void addMetaCell(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, labelFont));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPadding(3);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(value, valFont));
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPadding(3);
        table.addCell(c2);
    }

    private void addBreakdownRow(PdfPTable table, String item, BigDecimal amount, Font font) {
        PdfPCell cellItem = new PdfPCell(new Phrase(item, font));
        cellItem.setPadding(5);
        table.addCell(cellItem);

        String amtStr = amount.compareTo(BigDecimal.ZERO) == 0 ? "-" : amount.setScale(2, RoundingMode.HALF_UP).toString();
        PdfPCell cellAmt = new PdfPCell(new Phrase(amtStr, font));
        cellAmt.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellAmt.setPadding(5);
        table.addCell(cellAmt);
    }

    private void addBreakdownRowBold(PdfPTable table, String item, BigDecimal amount, Font font) {
        PdfPCell cellItem = new PdfPCell(new Phrase(item, font));
        cellItem.setPadding(6);
        cellItem.setBackgroundColor(new java.awt.Color(245, 245, 245));
        table.addCell(cellItem);

        PdfPCell cellAmt = new PdfPCell(new Phrase(amount.setScale(2, RoundingMode.HALF_UP).toString(), font));
        cellAmt.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellAmt.setPadding(6);
        cellAmt.setBackgroundColor(new java.awt.Color(245, 245, 245));
        table.addCell(cellAmt);
    }

    private LocalDate[] parseMonthRange(String monthStr) {
        try {
            String[] parts = monthStr.split(" ");
            String monthName = parts[0];
            int year = Integer.parseInt(parts[1]);

            int monthNum = 1;
            for (int i = 1; i <= 12; i++) {
                String mName = java.time.Month.of(i).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                String mShort = java.time.Month.of(i).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                if (mName.equalsIgnoreCase(monthName) || mShort.equalsIgnoreCase(monthName)) {
                    monthNum = i;
                    break;
                }
            }

            LocalDate start = LocalDate.of(year, monthNum, 1);
            LocalDate end = start.with(TemporalAdjusters.lastDayOfMonth());
            return new LocalDate[]{start, end};
        } catch (Exception e) {
            // Default fallback: current month
            LocalDate start = LocalDate.now().withDayOfMonth(1);
            LocalDate end = start.with(TemporalAdjusters.lastDayOfMonth());
            return new LocalDate[]{start, end};
        }
    }

    private static String[] splitEmails(String value) {
        if (!StringUtils.hasText(value)) return new String[0];
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toArray(String[]::new);
    }

    private JavaMailSender buildSender(MailSettingsService.ResolvedMailSettings settings) {
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        if (StringUtils.hasText(settings.host)) {
            impl.setHost(settings.host);
        }
        impl.setPort(settings.port > 0 ? settings.port : 587);
        if (StringUtils.hasText(settings.username)) {
            impl.setUsername(settings.username);
        }
        if (StringUtils.hasText(settings.password)) {
            impl.setPassword(settings.password);
        }
        Properties props = impl.getJavaMailProperties();
        props.put("mail.smtp.auth", String.valueOf(settings.smtpAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(settings.starttls));
        return impl;
    }

    private static final String[] units = {
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };

    private static final String[] tens = {
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    private String convertToWords(int number) {
        if (number == 0) {
            return "Zero";
        }
        if (number < 0) {
            return "Minus " + convertToWords(Math.abs(number));
        }
        String words = "";
        if ((number / 10000000) > 0) {
            words += convertToWords(number / 10000000) + " Crore ";
            number %= 10000000;
        }
        if ((number / 100000) > 0) {
            words += convertToWords(number / 100000) + " Lakh ";
            number %= 100000;
        }
        if ((number / 1000) > 0) {
            words += convertToWords(number / 1000) + " Thousand ";
            number %= 1000;
        }
        if ((number / 100) > 0) {
            words += convertToWords(number / 100) + " Hundred ";
            number %= 100;
        }
        if (number > 0) {
            if (!words.isEmpty()) {
                words += "and ";
            }
            if (number < 20) {
                words += units[number];
            } else {
                words += tens[number / 10];
                if ((number % 10) > 0) {
                    words += "-" + units[number % 10];
                }
            }
        }
        return words.trim();
    }
}
