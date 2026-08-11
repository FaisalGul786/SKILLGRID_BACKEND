import nodemailer from 'nodemailer';

export async function sendTestOtp(toEmail, otpCode) {
  // 1. Generate a temporary test account dynamically
  const testAccount = await nodemailer.createTestAccount();

  // 2. Create the transporter using Ethereal's SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // 3. Send to ANY email address
  const info = await transporter.sendMail({
    from: '"Auth Service" <noreply@yourdomain.com>',
    to: toEmail,
    subject: `${otpCode} is your verification code`,
    html: `<h2>Your code is: <strong>${otpCode}</strong></h2>`,
  });

  console.log('Message sent ID:', info.messageId);
  
  // 4. Click this URL printed in your terminal to inspect the email
  console.log('Preview Email URL:', nodemailer.getTestMessageUrl(info));
}

// Example invocation
// sendTestOtp('hecax50451@primetor.com', '849201');