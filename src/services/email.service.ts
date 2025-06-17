import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import logger from "../utils/logger";

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, you can use a test account
    // For production, configure with your SMTP details
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || ""
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Load template file
      const templatePath = path.join(__dirname, "../templates", `${options.template}.hbs`);
      const templateSource = fs.readFileSync(templatePath, "utf8");
      
      // Compile template with Handlebars
      const template = Handlebars.compile(templateSource);
      const html = template(options.context);

      // Send email
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Your App" <noreply@yourapp.com>',
        to: options.to,
        subject: options.subject,
        html
      });

      logger.info("Email sent", { messageId: info.messageId, to: options.to });
      return true;
    } catch (error) {
      logger.error("Error sending email", { error, to: options.to });
      return false;
    }
  }
}