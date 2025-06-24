import nodemailer from "nodemailer";

// Send email from any sender credentials, with error handling
export const sendEmail = async (
  fromEmail: string,
  fromPass: string,
  to: string,
  subject: string,
  text: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: fromEmail,
      pass: fromPass,
    },
  });
  const mailOptions = {
    from: fromEmail,
    to,
    subject,
    text,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};

// Send email using default credentials from .env (for backward compatibility)
export const sendReminderEmail = async (
  to: string,
  subject: string,
  text: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};
