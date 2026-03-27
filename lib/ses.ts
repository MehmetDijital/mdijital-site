import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

const getSmtpTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return null;
};

export async function sendEmail({
  to,
  subject,
  body,
  htmlBody,
}: {
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
}) {
  const fromEmail = process.env.EMAIL_FROM || process.env.AWS_SES_FROM_EMAIL;

  if (!fromEmail) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== EMAIL (Development - Not Sent) ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      const codeMatch = body.match(/(\d{6})/);
      if (codeMatch) console.log('VERIFICATION CODE:', codeMatch[1]);
      console.log('==========================================\n');
    }
    throw new Error('Email not configured: EMAIL_FROM or AWS_SES_FROM_EMAIL required');
  }

  // Sanitize email address
  const sanitizedEmail = to.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    throw new Error('Invalid email address');
  }

  try {
    // Try SMTP first if configured
    const smtpTransporter = getSmtpTransporter();
    if (smtpTransporter) {
      console.log(`[EMAIL] Sending email via SMTP to: ${sanitizedEmail}, from: ${fromEmail}`);
      const result = await smtpTransporter.sendMail({
        from: fromEmail,
        to: sanitizedEmail,
        subject,
        text: body,
        html: htmlBody,
      });
      console.log(`[EMAIL] Email sent successfully. MessageId: ${result.messageId}`);
      // Extract and log verification code if present
      const codeMatch = body.match(/(\d{6})/);
      if (codeMatch) {
        console.log(`[EMAIL] Verification Code: ${codeMatch[1]}`);
      }
      return;
    }

    if (!sesClient) {
      throw new Error('Email transport not configured: set SMTP_* or AWS SES credentials');
    }

    const messageBody: any = {
      Text: {
        Data: body,
        Charset: 'UTF-8',
      },
    };

    if (htmlBody) {
      messageBody.Html = {
        Data: htmlBody,
        Charset: 'UTF-8',
      };
    }

    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: [sanitizedEmail],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: messageBody,
      },
    });

    await sesClient.send(command);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Email verification template
export function getVerificationEmailTemplate(code: string, locale: string = 'tr') {
  const isTR = locale === 'tr';
  
  const subject = isTR 
    ? 'M Dijital - E-posta Doğrulama Kodu'
    : 'M Dijital - Email Verification Code';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code-box { background: #f4f4f4; border: 2px solid #39ff14; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .code { font-size: 32px; font-weight: bold; color: #39ff14; letter-spacing: 8px; font-family: monospace; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${isTR ? 'E-posta Doğrulama' : 'Email Verification'}</h2>
        <p>${isTR ? 'Merhaba,' : 'Hello,'}</p>
        <p>${isTR ? 'E-posta adresinizi doğrulamak için aşağıdaki kodu kullanın:' : 'Use the code below to verify your email address:'}</p>
        <div class="code-box">
          <div class="code">${code}</div>
        </div>
        <p>${isTR ? 'Bu kod 10 dakika geçerlidir.' : 'This code is valid for 10 minutes.'}</p>
        <p>${isTR ? 'Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.' : 'If you did not request this, you can safely ignore this email.'}</p>
        <div class="footer">
          <p>M Dijital</p>
          <p>${isTR ? 'Bu bir otomatik e-postadır, lütfen yanıtlamayın.' : 'This is an automated email, please do not reply.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textBody = isTR
    ? `E-posta Doğrulama Kodu\n\nDoğrulama kodunuz: ${code}\n\nBu kod 10 dakika geçerlidir.\n\nM Dijital`
    : `Email Verification Code\n\nYour verification code: ${code}\n\nThis code is valid for 10 minutes.\n\nM Dijital`;

  return { subject, htmlBody, textBody };
}

// Base URL for email links: use origin only to avoid double path (e.g. /auth/auth/)
function getBaseUrlForEmails(): string {
  const defaultUrl = process.env.NODE_ENV === 'production' ? 'https://mdijital.io' : 'http://localhost:3000';
  const url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || defaultUrl;
  try {
    return new URL(url).origin;
  } catch {
    return defaultUrl;
  }
}

// Password reset template
export function getPasswordResetEmailTemplate(token: string, locale: string = 'tr') {
  const isTR = locale === 'tr';
  const baseUrl = getBaseUrlForEmails();
  const pathPrefix = locale === 'tr' ? '' : `${locale}/`;
  const resetUrl = `${baseUrl}/${pathPrefix}auth/reset-password?token=${token}`;
  
  const subject = isTR
    ? 'M Dijital - Şifre Sıfırlama'
    : 'M Dijital - Password Reset';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #39ff14; color: #000; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .warning { color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${isTR ? 'Şifre Sıfırlama' : 'Password Reset'}</h2>
        <p>${isTR ? 'Merhaba,' : 'Hello,'}</p>
        <p>${isTR ? 'Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:' : 'Click the link below to reset your password:'}</p>
        <p><a href="${resetUrl}" class="button">${isTR ? 'Şifremi Sıfırla' : 'Reset Password'}</a></p>
        <p class="warning">${isTR ? 'Bu bağlantı 1 saat geçerlidir.' : 'This link is valid for 1 hour.'}</p>
        <p class="warning">${isTR ? 'Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.' : 'If you did not request this, you can safely ignore this email.'}</p>
        <div class="footer">
          <p>M Dijital</p>
          <p>${isTR ? 'Bu bir otomatik e-postadır, lütfen yanıtlamayın.' : 'This is an automated email, please do not reply.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textBody = isTR
    ? `Şifre Sıfırlama\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n${resetUrl}\n\nBu bağlantı 1 saat geçerlidir.\n\nM Dijital`
    : `Password Reset\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nM Dijital`;

  return { subject, htmlBody, textBody };
}

// Newsletter welcome email template
export function getNewsletterWelcomeEmailTemplate(locale: string = 'tr') {
  const isTR = locale === 'tr';
  
  const subject = isTR
    ? 'M Dijital - Haber Bültenine Hoş Geldiniz'
    : 'M Dijital - Welcome to Our Newsletter';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${isTR ? 'Haber Bültenine Hoş Geldiniz' : 'Welcome to Our Newsletter'}</h2>
        <p>${isTR ? 'Merhaba,' : 'Hello,'}</p>
        <p>${isTR ? 'Haber bültenimize abone olduğunuz için teşekkür ederiz! En son haberlerimiz, güncellemelerimiz ve özel içeriklerimizden haberdar olacaksınız.' : 'Thank you for subscribing to our newsletter! You will receive our latest news, updates, and exclusive content.'}</p>
        <p>${isTR ? 'İstediğiniz zaman abonelikten çıkabilirsiniz.' : 'You can unsubscribe at any time.'}</p>
        <div class="footer">
          <p>M Dijital</p>
          <p>${isTR ? 'Bu bir otomatik e-postadır, lütfen yanıtlamayın.' : 'This is an automated email, please do not reply.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textBody = isTR
    ? `Haber Bültenine Hoş Geldiniz\n\nHaber bültenimize abone olduğunuz için teşekkür ederiz!\n\nM Dijital`
    : `Welcome to Our Newsletter\n\nThank you for subscribing to our newsletter!\n\nM Dijital`;

  return { subject, htmlBody, textBody };
}

// Newsletter unsubscribe confirmation template
export function getNewsletterUnsubscribeEmailTemplate(locale: string = 'tr') {
  const isTR = locale === 'tr';
  
  const subject = isTR
    ? 'M Dijital - Abonelikten Çıkış Onayı'
    : 'M Dijital - Unsubscribe Confirmation';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${isTR ? 'Abonelikten Çıkış Onayı' : 'Unsubscribe Confirmation'}</h2>
        <p>${isTR ? 'Merhaba,' : 'Hello,'}</p>
        <p>${isTR ? 'Haber bülteni aboneliğiniz iptal edilmiştir.' : 'Your newsletter subscription has been cancelled.'}</p>
        <p>${isTR ? 'İstediğiniz zaman tekrar abone olabilirsiniz.' : 'You can subscribe again at any time.'}</p>
        <div class="footer">
          <p>M Dijital</p>
          <p>${isTR ? 'Bu bir otomatik e-postadır, lütfen yanıtlamayın.' : 'This is an automated email, please do not reply.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textBody = isTR
    ? `Abonelikten Çıkış Onayı\n\nHaber bülteni aboneliğiniz iptal edilmiştir.\n\nM Dijital`
    : `Unsubscribe Confirmation\n\nYour newsletter subscription has been cancelled.\n\nM Dijital`;

  return { subject, htmlBody, textBody };
}

// Password change confirmation template
export function getPasswordChangeEmailTemplate(locale: string = 'tr') {
  const isTR = locale === 'tr';
  
  const subject = isTR
    ? 'M Dijital - Şifre Değişikliği Onayı'
    : 'M Dijital - Password Change Confirmation';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${isTR ? 'Şifre Değişikliği Onayı' : 'Password Change Confirmation'}</h2>
        <p>${isTR ? 'Merhaba,' : 'Hello,'}</p>
        <p>${isTR ? 'Hesabınızın şifresi başarıyla değiştirilmiştir.' : 'Your account password has been successfully changed.'}</p>
        <div class="warning">
          <p><strong>${isTR ? 'Güvenlik Uyarısı:' : 'Security Notice:'}</strong></p>
          <p>${isTR ? 'Eğer bu işlemi siz yapmadıysanız, lütfen derhal bizimle iletişime geçin.' : 'If you did not make this change, please contact us immediately.'}</p>
        </div>
        <div class="footer">
          <p>M Dijital</p>
          <p>${isTR ? 'Bu bir otomatik e-postadır, lütfen yanıtlamayın.' : 'This is an automated email, please do not reply.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textBody = isTR
    ? `Şifre Değişikliği Onayı\n\nHesabınızın şifresi başarıyla değiştirilmiştir.\n\nEğer bu işlemi siz yapmadıysanız, lütfen derhal bizimle iletişime geçin.\n\nM Dijital`
    : `Password Change Confirmation\n\nYour account password has been successfully changed.\n\nIf you did not make this change, please contact us immediately.\n\nM Dijital`;

  return { subject, htmlBody, textBody };
}

// Profile update confirmation template
export function getProfileUpdateEmailTemplate(locale: string = 'tr') {
  const isTR = locale === 'tr';
  
  const subject = isTR
    ? 'M Dijital - Profil Güncelleme Onayı'
    : 'M Dijital - Profile Update Confirmation';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${isTR ? 'Profil Güncelleme Onayı' : 'Profile Update Confirmation'}</h2>
        <p>${isTR ? 'Merhaba,' : 'Hello,'}</p>
        <p>${isTR ? 'Hesabınızın profil bilgileri başarıyla güncellenmiştir.' : 'Your account profile information has been successfully updated.'}</p>
        <div class="footer">
          <p>M Dijital</p>
          <p>${isTR ? 'Bu bir otomatik e-postadır, lütfen yanıtlamayın.' : 'This is an automated email, please do not reply.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textBody = isTR
    ? `Profil Güncelleme Onayı\n\nHesabınızın profil bilgileri başarıyla güncellenmiştir.\n\nM Dijital`
    : `Profile Update Confirmation\n\nYour account profile information has been successfully updated.\n\nM Dijital`;

  return { subject, htmlBody, textBody };
}

// Project request confirmation template
export function getProjectRequestConfirmationEmailTemplate(locale: string = 'tr') {
  const isTR = locale === 'tr';
  const baseUrl = getBaseUrlForEmails();
  const pathPrefix = locale === 'tr' ? '' : `${locale}/`;
  const dashboardUrl = `${baseUrl}/${pathPrefix}dashboard`;
  
  const subject = isTR
    ? 'M Dijital - Proje Talebiniz Alındı'
    : 'M Dijital - Project Request Received';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #39ff14; color: #000; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${isTR ? 'Proje Talebiniz Alındı' : 'Project Request Received'}</h2>
        <p>${isTR ? 'Merhaba,' : 'Hello,'}</p>
        <p>${isTR ? 'Proje talebiniz başarıyla alınmıştır. En kısa sürede inceleyip size geri dönüş yapacağız.' : 'Your project request has been received successfully. We will review it and get back to you as soon as possible.'}</p>
        <p>${isTR ? 'Talebinizin durumunu dashboard\'unuzdan takip edebilirsiniz:' : 'You can track the status of your request from your dashboard:'}</p>
        <p><a href="${dashboardUrl}" class="button">${isTR ? 'Dashboard\'a Git' : 'Go to Dashboard'}</a></p>
        <div class="footer">
          <p>M Dijital</p>
          <p>${isTR ? 'Bu bir otomatik e-postadır, lütfen yanıtlamayın.' : 'This is an automated email, please do not reply.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textBody = isTR
    ? `Proje Talebiniz Alındı\n\nProje talebiniz başarıyla alınmıştır. En kısa sürede inceleyip size geri dönüş yapacağız.\n\nDashboard: ${dashboardUrl}\n\nM Dijital`
    : `Project Request Received\n\nYour project request has been received successfully. We will review it and get back to you as soon as possible.\n\nDashboard: ${dashboardUrl}\n\nM Dijital`;

  return { subject, htmlBody, textBody };
}

// Contact form confirmation template
export function getContactConfirmationEmailTemplate(locale: string = 'tr') {
  const isTR = locale === 'tr';
  
  const subject = isTR
    ? 'M Dijital - Mesajınız Alındı'
    : 'M Dijital - Your Message Has Been Received';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${isTR ? 'Mesajınız Alındı' : 'Your Message Has Been Received'}</h2>
        <p>${isTR ? 'Merhaba,' : 'Hello,'}</p>
        <p>${isTR ? 'Mesajınız başarıyla alınmıştır. En kısa sürede size geri dönüş yapacağız.' : 'Your message has been received successfully. We will get back to you as soon as possible.'}</p>
        <div class="footer">
          <p>M Dijital</p>
          <p>${isTR ? 'Bu bir otomatik e-postadır, lütfen yanıtlamayın.' : 'This is an automated email, please do not reply.'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textBody = isTR
    ? `Mesajınız Alındı\n\nMesajınız başarıyla alınmıştır. En kısa sürede size geri dönüş yapacağız.\n\nM Dijital`
    : `Your Message Has Been Received\n\nYour message has been received successfully. We will get back to you as soon as possible.\n\nM Dijital`;

  return { subject, htmlBody, textBody };
}