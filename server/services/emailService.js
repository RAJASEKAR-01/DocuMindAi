const nodemailer = require("nodemailer");

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendWelcomeEmail = async (to, name) => {
  // Fails silently (logged only) so email issues never block registration
  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Welcome to DocuMind AI",
      html: `<p>Hi ${name},</p><p>Welcome to DocuMind AI. Upload your first document to get an instant AI-powered risk analysis.</p>`,
    });
  } catch (error) {
    console.error("Email send failed (non-blocking):", error.message);
  }
};

const sendAnalysisReadyEmail = async (to, name, documentName) => {
  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Your analysis for "${documentName}" is ready`,
      html: `<p>Hi ${name},</p><p>Your AI analysis for <strong>${documentName}</strong> has finished processing. Log in to view the results.</p>`,
    });
  } catch (error) {
    console.error("Email send failed (non-blocking):", error.message);
  }
};

module.exports = { sendWelcomeEmail, sendAnalysisReadyEmail };
