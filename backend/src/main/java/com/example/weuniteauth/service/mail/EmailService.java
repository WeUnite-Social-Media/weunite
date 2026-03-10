package com.example.weuniteauth.service.mail;

import com.example.weuniteauth.exceptions.mail.EmailSendingException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String to,
                          String subject,
                          String template,
                          Map<String, Object> templateVars) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom(fromEmail);

            String htmlContent = loadTemplate(template);
            htmlContent = replaceTemplateVariables(htmlContent, templateVars);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new EmailSendingException("Erro ao enviar email para " + to, e);
        }
    }

    private String loadTemplate(String template) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/emails/" + template);
            Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            return FileCopyUtils.copyToString(reader);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível carregar o template: " + template, e);
        }
    }

    private String replaceTemplateVariables(String template, Map<String, Object> templateVars) {
        String result = template;
        for (Map.Entry<String, Object> entry : templateVars.entrySet()) {
            String placeholder = "{" + entry.getKey() + "}";
            result = result.replace(placeholder, entry.getValue() != null ? entry.getValue().toString() : "");
        }
        return result;
    }


    @Async
    public void sendVerificationEmailAsync(String to, String verificationToken) {
        Map<String, Object> templateVars = new HashMap<>();
        templateVars.put("verificationToken", verificationToken);
        sendEmail(to, "Verificação de email", "verification.html", templateVars);
    }

    @Async
    public void sendVerificationEmailClub(String to, String cnpj, String name, String username, String email) {
        Map<String, Object> templateVars = new HashMap<>();
        templateVars.put("cnpj", cnpj);
        templateVars.put("name", name);
        templateVars.put("username", username);
        templateVars.put("email", email);
        sendEmail(to, "Solicitação de cadastro WeUnite", "verificationClub.html", templateVars);
    }

    @Async
    public void sendPasswordResetRequestEmail(String to, String verificationToken) {
        Map<String, Object> templateVars = new HashMap<>();
        templateVars.put("verificationToken", verificationToken);
        sendEmail(to, "Redefinição de senha", "passwordResetRequest.html", templateVars);
    }

    @Async
    public void sendPasswordResetSuccessEmail(String to) {
        Map<String, Object> templateVars = new HashMap<>();
        sendEmail(to, "Senha redefinida com sucesso!", "passwordResetSuccess.html", templateVars);
    }

    @Async
    public void sendWelcomeEmail(String to, String name) {
        Map<String, Object> templateVars = new HashMap<>();
        templateVars.put("name", name);
        sendEmail(to, "Bem-vindo a WeUnite!", "welcome.html", templateVars);
    }
}
