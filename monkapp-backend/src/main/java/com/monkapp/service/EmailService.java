package com.monkapp.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void enviarCodigo(String destino, String nombre, String codigo) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail, "MonkApp");
            helper.setTo(destino);
            helper.setSubject("🐒 Tu código de verificación - MonkApp");
            helper.setText(buildHtml(nombre, codigo), true);
            mailSender.send(msg);
            log.info("Código enviado a {}", destino);
        } catch (Exception e) {
            log.error("Error enviando correo a {}: {}", destino, e.getMessage());
        }
    }

    private String buildHtml(String nombre, String codigo) {
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:40px 0;">
                  <table width="520" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;
                                box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#6C63FF,#FF6584);
                                 padding:32px;text-align:center;">
                        <h1 style="margin:0;color:#fff;font-size:28px;">🐒 MonkApp</h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                          Gestión para tu negocio
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px 32px;text-align:center;">
                        <p style="font-size:16px;color:#333;margin:0 0 8px;">
                          Hola <strong>%s</strong>,
                        </p>
                        <p style="font-size:15px;color:#666;margin:0 0 32px;">
                          Usa este código para verificar tu cuenta:
                        </p>
                        <div style="background:#f7f5ff;border:2px dashed #6C63FF;
                                    border-radius:12px;padding:24px;margin:0 auto;display:inline-block;">
                          <span style="font-size:48px;font-weight:900;
                                       color:#6C63FF;letter-spacing:12px;">%s</span>
                        </div>
                        <p style="font-size:13px;color:#999;margin:24px 0 0;">
                          Este código expira en <strong>10 minutos</strong>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#fafafa;padding:20px 32px;text-align:center;
                                 border-top:1px solid #eee;">
                        <p style="font-size:12px;color:#bbb;margin:0;">
                          Si no creaste esta cuenta, ignora este mensaje.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body></html>
            """.formatted(nombre, codigo);
    }
}
