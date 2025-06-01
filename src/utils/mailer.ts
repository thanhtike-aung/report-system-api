import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    console.log(process.env.EMAIL_USER);
    console.log(process.env.EMAIL_PASSWORD);
    console.log(options);
    await transporter.sendMail({
      from: `"Dev02 Report System" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendAccountEmail = async (
  email: string,
  password: string,
): Promise<void> => {
  const htmlContent = `
    <h2>Welcome to Our Platform!</h2>
    <p>You have been successfully registered on dev02 report system. Here are your credentials:</p>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>Please change your password after first login.</p>
  `;
  console.log("utils");

  await sendEmail({
    to: email,
    subject: "Your Account Credentials",
    html: htmlContent,
  });
};
