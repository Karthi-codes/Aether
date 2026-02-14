import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Debug: Log environment variables (remove in production)
        console.log('=== Email Service Configuration ===');
        console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
        console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***SET***' : 'MISSING');
        console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
        console.log('===================================');

        // Validate required environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
        }

        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD, // Gmail App Password
            },
        });
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || `Aether <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${options.to}`);
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Failed to send email');
        }
    }

    async sendOTPEmail(email: string, otp: string, name: string): Promise<void> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Aether</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #D4AF37 100%); padding: 30px 20px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: 2px;">AETHER</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email</h2>
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hello ${name},
                            </p>
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Thank you for registering with Aether! Please use the following One-Time Password (OTP) to verify your email address:
                            </p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%); padding: 30px; border-radius: 12px; border: 2px solid #D4AF37; display: inline-block;">
                                            <div style="color: #D4AF37; font-size: 48px; font-weight: bold; letter-spacing: 12px; margin: 0;">
                                                ${otp}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                This OTP will expire in <strong style="color: #D4AF37;">5 minutes</strong>.
                            </p>
                            <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0;">
                                If you didn't request this verification, please ignore this email or contact our support team if you have concerns.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #333; padding: 20px 30px; text-align: center;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                © 2026 Aether. All rights reserved.
                            </p>
                            <p style="color: #666; font-size: 11px; margin: 10px 0 0 0;">
                                This is an automated email. Please do not reply.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Verify Your Email - Aether',
            html,
        });
    }

    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Aether</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #D4AF37 100%); padding: 30px 20px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: 2px;">AETHER</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #333; margin: 0 0 20px 0;">Welcome to Aether, ${name}!</h2>
                            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                                Your email has been successfully verified. You now have full access to all Aether features.
                            </p>
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-top: 20px;">
                                We've added <strong style="color: #D4AF37;">$1000</strong> as a welcome bonus to your wallet!
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #333; padding: 20px 30px; text-align: center;">
                            <p style="color: #999; font-size: 12px; margin: 0;">© 2026 Aether. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        await this.sendEmail({
            to: email,
            subject: 'Welcome to Aether!',
            html,
        });
    }
}

export const emailService = new EmailService();
export default emailService;
