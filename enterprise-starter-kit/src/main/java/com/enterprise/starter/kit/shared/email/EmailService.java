package com.enterprise.starter.kit.shared.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Email service for sending transactional HTML emails.
 *
 * <p>
 * Upgrades all emails from plain-text to styled HTML templates.
 * Safely skips sending when {@code app.mail.enabled=false} or when
 * no {@link JavaMailSender} bean is available (no SMTP credentials configured).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final Optional<JavaMailSender> mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@maykamasifuen.com}")
    private String fromAddress;

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String frontendUrl;

    public EmailService(Optional<JavaMailSender> mailSender) {
        this.mailSender = mailSender;
    }

    // -------------------------------------------------------------------------
    // Password Reset
    // -------------------------------------------------------------------------

    /// Sends a password reset email with a link containing the reset token.
    ///
    /// @param to         recipient email address
    /// @param resetToken the password reset token
    public void sendPasswordResetEmail(String to, String resetToken) {
        String resetUrl = frontendUrl.split(",")[0] + "/reset-password?token=" + resetToken;
        String subject = "Mayk Enterprise Kit – Password Reset Request";
        String html = """
                <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
                  <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 0;">
                      <table width="600" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
                        <tr><td style="background:#1a1a2e;padding:24px 32px;">
                          <h1 style="color:#fff;margin:0;font-size:20px;">🔐 Mayk Enterprise Kit</h1>
                        </td></tr>
                        <tr><td style="padding:32px;">
                          <h2 style="color:#333;margin-top:0;">Password Reset Request</h2>
                          <p style="color:#555;line-height:1.6;">We received a request to reset your password. Click the button below to proceed:</p>
                          <div style="text-align:center;margin:32px 0;">
                            <a href="%s" style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:bold;display:inline-block;">
                              Reset My Password
                            </a>
                          </div>
                          <p style="color:#888;font-size:13px;">This link expires in <strong>1 hour</strong>. If you did not request this, simply ignore this email.</p>
                        </td></tr>
                        <tr><td style="background:#f9f9f9;padding:16px 32px;text-align:center;">
                          <p style="color:#aaa;font-size:12px;margin:0;">© 2026 Mayk Enterprise Kit · All rights reserved</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """
                .formatted(resetUrl);

        sendHtmlEmail(to, subject, html);
    }

    // -------------------------------------------------------------------------
    // Welcome Email
    // -------------------------------------------------------------------------

    /// Sends a welcome email after successful tenant registration.
    ///
    /// @param to          recipient email address
    /// @param companyName the name of the newly registered company
    public void sendWelcomeEmail(String to, String companyName) {
        String loginUrl = frontendUrl.split(",")[0] + "/login";
        String subject = "Welcome to Mayk Enterprise Kit – " + companyName;
        String html = """
                <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
                  <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 0;">
                      <table width="600" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
                        <tr><td style="background:#1a1a2e;padding:24px 32px;">
                          <h1 style="color:#fff;margin:0;font-size:20px;">🏢 Mayk Enterprise Kit</h1>
                        </td></tr>
                        <tr><td style="padding:32px;">
                          <h2 style="color:#333;margin-top:0;">Welcome aboard, %s! 🎉</h2>
                          <p style="color:#555;line-height:1.6;">Your workspace has been created successfully. You're ready to start managing your business.</p>
                          <ul style="color:#555;line-height:2;">
                            <li>📋 <strong>Settings</strong> – Configure your company information</li>
                            <li>👥 <strong>Customers</strong> – Add your first customers</li>
                            <li>🧾 <strong>Invoices</strong> – Create and manage invoices</li>
                            <li>📊 <strong>Dashboard</strong> – Track your business analytics</li>
                          </ul>
                          <div style="text-align:center;margin:32px 0;">
                            <a href="%s" style="background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:bold;display:inline-block;">
                              Go to Dashboard
                            </a>
                          </div>
                        </td></tr>
                        <tr><td style="background:#f9f9f9;padding:16px 32px;text-align:center;">
                          <p style="color:#aaa;font-size:12px;margin:0;">© 2026 Mayk Enterprise Kit · All rights reserved</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """
                .formatted(companyName, loginUrl);

        sendHtmlEmail(to, subject, html);
    }

    // -------------------------------------------------------------------------
    // Core send method
    // -------------------------------------------------------------------------

    /// Sends a generic HTML email. If email is disabled, logs the message instead.
    ///
    /// @param to       recipient email address
    /// @param subject  email subject
    /// @param htmlBody email body text in HTML format
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!mailEnabled || mailSender.isEmpty()) {
            log.info("📧 [Email Disabled] To: {}, Subject: {}", to, subject);
            return;
        }
        try {
            JavaMailSender sender = mailSender.get();
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            sender.send(message);
            log.info("📧 HTML email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("📧 Failed to send email to: {} – {}", to, e.getMessage());
        }
    }

    /** Kept for backward compatibility with any callers passing plain text. */
    public void sendEmail(String to, String subject, String body) {
        String html = "<pre style='font-family:Arial,sans-serif'>" + body + "</pre>";
        sendHtmlEmail(to, subject, html);
    }
}
