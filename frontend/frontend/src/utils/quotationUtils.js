import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const QUOTATION_STORAGE_KEY = "svl_quotations";
export const QUOTATION_DRAFT_STORAGE_KEY = "svl_quotation_draft";
export const QUOTATION_STATUS_DRAFT = "DRAFT";
export const QUOTATION_STATUS_VERIFICATION_PENDING = "VERIFICATION_PENDING";
export const QUOTATION_STATUS_APPROVED = "APPROVED";
export const QUOTATION_STATUS_SENT = "QUOTATION_SENT";
export const QUOTATION_STATUS_NEGOTIATING = "NEGOTIATING";
export const QUOTATION_STATUS_REJECTED = "QUOTATION_REJECTED";
export const QUOTATION_STATUS_ACCEPTED = "QUOTATION_ACCEPTED";

export function sanitizeFilenamePart(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function numberToWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n) {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ` ${ones[n % 10]}` : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? ` ${convert(n % 100)}` : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? ` ${convert(n % 1000)}` : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? ` ${convert(n % 100000)}` : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? ` ${convert(n % 10000000)}` : "");
  }

  return convert(num) || "Zero";
}

function readLocalStorageJson(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStorageJson(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredQuotations() {
  const stored = readLocalStorageJson(QUOTATION_STORAGE_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

export function saveStoredQuotations(quotations) {
  writeLocalStorageJson(QUOTATION_STORAGE_KEY, quotations);
}

export function upsertStoredQuotation(quotation) {
  const quotations = getStoredQuotations();
  const existingIndex = quotations.findIndex((item) => item.id === quotation.id);

  if (existingIndex >= 0) {
    quotations[existingIndex] = quotation;
  } else {
    quotations.unshift(quotation);
  }

  saveStoredQuotations(quotations);
  return quotation;
}

export function deleteStoredQuotation(quotationId) {
  const quotations = getStoredQuotations().filter((item) => item.id !== quotationId);
  saveStoredQuotations(quotations);
  return quotations;
}

export function getQuotationDraft() {
  return readLocalStorageJson(QUOTATION_DRAFT_STORAGE_KEY, null);
}

export function setQuotationDraft(draft) {
  writeLocalStorageJson(QUOTATION_DRAFT_STORAGE_KEY, draft);
}

export function clearQuotationDraft() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(QUOTATION_DRAFT_STORAGE_KEY);
  }
}

export function createQuotationPayload({
  id,
  quotationNumber,
  quotationDate,
  customerName,
  partyMode,
  selectedLead,
  lineItems,
  discountPct,
  cgstPct,
  sgstPct,
  totals,
  status,
  verificationRequestedAt,
  verificationRequestedById,
  verificationRequestedByName,
  verificationRequestedByRole,
  verificationRequestNotes,
  approvedAt,
  approvedById,
  approvedByName,
  approvedByRole,
  approvalNotes,
  createdBy,
  createdById,
  createdByName,
  createdByEmail,
  createdByRole,
  createdByTeam,
  createdAt,
}) {
  const now = new Date().toISOString();
  const resolvedId = id || `quotation-${Date.now()}`;

  return {
    id: resolvedId,
    quotationNumber: quotationNumber || `QT-${Date.now()}`,
    quotationDate,
    customerName,
    partyMode,
    selectedLead,
    lineItems,
    discountPct,
    cgstPct,
    sgstPct,
    totals,
    status: status || QUOTATION_STATUS_DRAFT,
    verificationRequestedAt: verificationRequestedAt || null,
    verificationRequestedById: verificationRequestedById || null,
    verificationRequestedByName: verificationRequestedByName || null,
    verificationRequestedByRole: verificationRequestedByRole || null,
    verificationRequestNotes: verificationRequestNotes || "",
    approvedAt: approvedAt || null,
    approvedById: approvedById || null,
    approvedByName: approvedByName || null,
    approvedByRole: approvedByRole || null,
    approvalNotes: approvalNotes || "",
    createdBy: createdBy || null,
    createdById: createdById || null,
    createdByName: createdByName || null,
    createdByEmail: createdByEmail || null,
    createdByRole: createdByRole || null,
    createdByTeam: createdByTeam || null,
    updatedAt: now,
    createdAt: createdAt || now,
  };
}

export function buildQuotationPdf({
  customerName,
  selectedLead,
  quotationDate,
  quotationNumber,
  lineItems,
  discountPct,
  cgstPct,
  sgstPct,
  totals,
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(14).setFont("helvetica", "bold");
  doc.text("SVL Printing & Packaging", 14, 15);

  doc.setFontSize(16).setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth - 14, 15, { align: "right" });

  doc.setFontSize(8).setFont("helvetica", "normal");
  let y = 22;
  doc.setFont("helvetica", "bold");
  doc.text("SVL Printing & Packaging", 14, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.text("26-2, First Floor, Brinda Layout Street No. 1,", 14, y);
  y += 3;
  doc.text("Krishnanagar, Chokkampudur Road, Coimbatore - 641 026", 14, y);
  y += 3;
  doc.text("Mob: +91-99441 66166, 98430 66166 | Work: +91-99436 66166", 14, y);
  y += 3;
  doc.text("Email: cakeboox.pack@gmail.com | GSTIN/UIN: 33AATFC1462D1Z0", 14, y);
  y += 3;
  doc.text("State: Tamil Nadu, Code: 33", 14, y);

  const rightX = 130;
  y = 22;
  doc.setFont("helvetica", "bold");
  doc.text("Quotation No.", rightX, y);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${quotationNumber}`, rightX + 35, y);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Dated", rightX, y);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${quotationDate}`, rightX + 35, y);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Valid For", rightX, y);
  doc.setFont("helvetica", "normal");
  doc.text(": 30 Days", rightX + 35, y);

  y = 48;
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BILL TO:", 14, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(customerName || "-", 14, y);
  y += 3;
  if (selectedLead?.streetAddress) {
    doc.text(selectedLead.streetAddress, 14, y);
    y += 3;
  }
  if (selectedLead?.state || selectedLead?.district) {
    const location = [selectedLead.district, selectedLead.state].filter(Boolean).join(", ");
    doc.text(location, 14, y);
    y += 3;
  }
  if (selectedLead?.email) {
    doc.text(`Email: ${selectedLead.email}`, 14, y);
    y += 3;
  }
  if (selectedLead?.mobile) {
    doc.text(`Phone: ${selectedLead.mobile}`, 14, y);
    y += 3;
  }

  const tableStartY = y + 4;
  autoTable(doc, {
    startY: tableStartY,
    head: [["Sl", "Product / Description", "Qty", "Rate", "Disc %", "Amount"]],
    body: lineItems.map((item, index) => [
      String(index + 1),
      `${item.productName}${item.optionsSummary ? `\n${item.optionsSummary}` : ""}`,
      String(item.quantity),
      `Rs. ${item.pricePerUnit.toFixed(2)}`,
      `${discountPct}%`,
      `Rs. ${item.lineTotal.toFixed(2)}`,
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: { 1: { cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 5;
  const summaryX = pageWidth - 80;

  doc.setFontSize(8).setFont("helvetica", "normal");
  doc.text("Subtotal:", summaryX, y);
  doc.text(`Rs. ${totals.subtotal.toFixed(2)}`, pageWidth - 16, y, { align: "right" });
  y += 4;

  if (discountPct > 0) {
    doc.text(`Discount (${discountPct}%):`, summaryX, y);
    doc.text(`- Rs. ${totals.discountAmt.toFixed(2)}`, pageWidth - 16, y, { align: "right" });
    y += 4;
  }

  if (cgstPct > 0) {
    doc.text(`CGST (${cgstPct}%):`, summaryX, y);
    doc.text(`Rs. ${totals.cgstAmt.toFixed(2)}`, pageWidth - 16, y, { align: "right" });
    y += 4;
  }

  if (sgstPct > 0) {
    doc.text(`SGST (${sgstPct}%):`, summaryX, y);
    doc.text(`Rs. ${totals.sgstAmt.toFixed(2)}`, pageWidth - 16, y, { align: "right" });
    y += 4;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("GRAND TOTAL:", summaryX, y);
  doc.text(`Rs. ${totals.grandTotal.toFixed(2)}`, pageWidth - 16, y, { align: "right" });
  y += 6;

  const amountWords = numberToWords(Math.round(totals.grandTotal));
  doc.setFontSize(7).setFont("helvetica", "italic");
  doc.text(`Amount in Words: ${amountWords} Rupees Only`, 14, y);

  y = pageHeight - 25;
  doc.setFontSize(7).setFont("helvetica", "normal");
  doc.text("Terms & Conditions:", 14, y);
  y += 3;
  doc.setFontSize(6);
  doc.text("1. This quotation is valid for 30 days from the date of issue.", 14, y);
  y += 3;
  doc.text("2. Prices are subject to change without prior notice.", 14, y);
  y += 3;
  doc.text("3. Payment terms: 50% advance, balance on delivery.", 14, y);

  doc.setFontSize(6).setFont("helvetica", "italic");
  doc.text("This is a computer-generated quotation.", pageWidth - 14, pageHeight - 5, { align: "right" });

  return doc;
}

export function downloadQuotationPdf(quotation) {
  const doc = buildQuotationPdf(quotation);
  const safeCustomerName = sanitizeFilenamePart(quotation.customerName, "Customer");
  const safeDate = sanitizeFilenamePart(
    quotation.quotationDate,
    new Date().toISOString().slice(0, 10),
  );
  const fileName = `Quotation_${safeCustomerName}_${safeDate}.pdf`;

  try {
    const pdfBlob = doc.output("blob");
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  } catch {
    doc.save(fileName);
  }
}
