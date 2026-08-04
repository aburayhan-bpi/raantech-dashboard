import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import fs from "fs/promises";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.CONTACT_EMAIL_USER,
    pass: process.env.CONTACT_EMAIL_APP_PASSWORD,
  },
});

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}
export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  try {
    const info = await transporter.sendMail({
      from: `Raantech <${process.env.CONTACT_EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendTemplateEmail = async (
  templateName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
  to: string,
  subject: string
) => {
  try {
    const templatePath = path.join(process.cwd(), "src", "templates", "emails", `${templateName}.ejs`);
    const templateContent = await fs.readFile(templatePath, "utf-8");
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const templateData = { ...data, appUrl };

    // We pass the filename so EJS can resolve `include()`
    const html = ejs.render(templateContent, templateData, { filename: templatePath });
    
    return await sendEmail({ to, subject, html });
  } catch (error) {
    console.error(`Error rendering/sending template ${templateName}:`, error);
    return false;
  }
};
