package com.nexorcrm.backend.service;

import com.nexorcrm.backend.entity.EmailNotificationLog;
import com.nexorcrm.backend.repo.EmailNotificationLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);
    private final JavaMailSender mailSender;
    private final EmailNotificationLogRepository logRepository;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.from-address:}")
    private String fromAddress;

    @Value("${app.mail.from-name:SVL}")
    private String fromName;

    @Value("${app.mail.cooldown-minutes:60}")
    private long cooldownMinutes;

    public EmailNotificationService(JavaMailSender mailSender,
                                    EmailNotificationLogRepository logRepository) {
        this.mailSender = mailSender;
        this.logRepository = logRepository;
    }

    public void notifyIfAllowed(String recipientEmail, String subject, String body) {
        if (!enabled) {
            log.warn("Email notifications disabled (app.mail.enabled=false). Skipping email to {}.", recipientEmail);
            return;
        }
        if (!StringUtils.hasText(recipientEmail)) {
            log.warn("Email notification skipped: empty recipient.");
            return;
        }

        String normalized = recipientEmail.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();

        Optional<EmailNotificationLog> existing = logRepository.findTopByRecipientEmailOrderByLastSentAtDesc(normalized);
        if (existing.isPresent()) {
            Duration diff = Duration.between(existing.get().getLastSentAt(), now);
            if (diff.toMinutes() < cooldownMinutes) {
                log.info("Email notification skipped for {} due to cooldown ({} min).", normalized, cooldownMinutes);
                return;
            }
        }

        try {
            sendEmail(normalized, subject, body);

            EmailNotificationLog logRow = existing.orElseGet(EmailNotificationLog::new);
            logRow.setRecipientEmail(normalized);
            logRow.setLastSentAt(now);
            logRepository.save(logRow);
            log.info("Email notification sent to {}.", normalized);
        } catch (Exception ex) {
            log.error("Email notification failed for {}.", normalized, ex);
        }
    }

    /**
     * Sends an email immediately when mail is enabled, skipping cooldown checks.
     * Useful for admin-triggered onboarding emails (e.g., offer letter).
     */
    public void notifyNowIfEnabled(String recipientEmail, String subject, String body) {
        if (!enabled) {
            log.warn("Email notifications disabled (app.mail.enabled=false). Skipping email to {}.", recipientEmail);
            return;
        }
        if (!StringUtils.hasText(recipientEmail)) {
            log.warn("Email notification skipped: empty recipient.");
            return;
        }

        String normalized = recipientEmail.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();
        Optional<EmailNotificationLog> existing = logRepository.findTopByRecipientEmailOrderByLastSentAtDesc(normalized);

        try {
            sendEmail(normalized, subject, body);

            EmailNotificationLog logRow = existing.orElseGet(EmailNotificationLog::new);
            logRow.setRecipientEmail(normalized);
            logRow.setLastSentAt(now);
            logRepository.save(logRow);
            log.info("Email notification sent to {}.", normalized);
        } catch (Exception ex) {
            log.error("Email notification failed for {}.", normalized, ex);
        }
    }

    private void sendEmail(String normalizedRecipientEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(normalizedRecipientEmail);
        if (StringUtils.hasText(fromAddress)) {
            message.setFrom(StringUtils.hasText(fromName)
                    ? String.format("%s <%s>", fromName, fromAddress)
                    : fromAddress);
        }
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
