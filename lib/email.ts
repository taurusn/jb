import { Resend } from 'resend';

/**
 * Email Service
 * Handles sending interview invitation emails
 */

interface InterviewEmailData {
  recipientEmail: string;
  recipientName: string;
  meetingLink: string;
  meetingDate: Date;
  duration: number;
  candidateName: string;
  employerName: string;
  companyName: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Initialize Resend client
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY not found in environment variables');
    return null;
  }

  return new Resend(apiKey);
}

/**
 * Format date for email display
 */
function formatDateForEmail(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Riyadh',
  };

  return date.toLocaleString('en-US', options) + ' (KSA Time)';
}

/**
 * Send interview invitation to candidate
 */
export async function sendCandidateInvitation(
  data: Omit<InterviewEmailData, 'recipientEmail' | 'recipientName'> & {
    candidateEmail: string;
  }
): Promise<EmailResult> {
  const resend = getResendClient();

  if (!resend) {
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const emailFrom = process.env.EMAIL_FROM || 'Ready HR <onboarding@resend.dev>';
    const formattedDate = formatDateForEmail(data.meetingDate);

    const result = await resend.emails.send({
      from: emailFrom,
      to: data.candidateEmail,
      subject: `Interview Invitation from ${data.companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Interview Invitation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #101820; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <tr>
                <td>
                  <!-- Logo/Header -->
                  <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background-color: #FEE715; border-radius: 12px; text-align: center; line-height: 60px; font-size: 32px; font-weight: bold; color: #101820; margin-bottom: 16px;">
                      R
                    </div>
                    <h1 style="margin: 0; font-size: 24px; color: #FEE715;">Interview Invitation</h1>
                  </div>

                  <!-- Main Content Card -->
                  <div style="background: linear-gradient(135deg, rgba(254, 231, 21, 0.1) 0%, rgba(16, 24, 32, 0.5) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(254, 231, 21, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Hello <strong>${data.candidateName}</strong>,
                    </p>

                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Great news! <strong>${data.companyName}</strong> has requested to interview you for a position. They're excited to discuss your application and learn more about you.
                    </p>

                    <!-- Interview Details -->
                    <div style="background-color: rgba(31, 41, 55, 0.6); border-left: 4px solid #FEE715; border-radius: 8px; padding: 20px; margin: 24px 0;">
                      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #FEE715;">Interview Details</h2>

                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #9CA3AF;">📅 Date & Time:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${formattedDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #9CA3AF;">⏱️ Duration:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${data.duration} minutes</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #9CA3AF;">🏢 Company:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${data.companyName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #9CA3AF;">👤 Interviewer:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${data.employerName}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Join Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${data.meetingLink}" style="display: inline-block; background-color: #FEE715; color: #101820; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        📹 Join Google Meet
                      </a>
                    </div>

                    <p style="font-size: 14px; line-height: 1.6; color: #9CA3AF; margin: 24px 0 0 0;">
                      💡 <strong>Tip:</strong> Join the meeting 5 minutes early to check your camera and microphone.
                    </p>
                  </div>

                  <!-- Footer -->
                  <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(254, 231, 21, 0.2);">
                    <p style="font-size: 14px; color: #9CA3AF; margin: 0 0 8px 0;">
                      This interview was scheduled through Ready HR
                    </p>
                    <p style="font-size: 12px; color: #6B7280; margin: 0;">
                      If you have any questions, please contact ${data.companyName} directly.
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Error sending candidate invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send interview invitation to employer
 */
export async function sendEmployerInvitation(
  data: Omit<InterviewEmailData, 'recipientEmail' | 'recipientName'> & {
    employerEmail: string;
  }
): Promise<EmailResult> {
  const resend = getResendClient();

  if (!resend) {
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const emailFrom = process.env.EMAIL_FROM || 'Ready HR <onboarding@resend.dev>';
    const formattedDate = formatDateForEmail(data.meetingDate);

    const result = await resend.emails.send({
      from: emailFrom,
      to: data.employerEmail,
      subject: `Interview Scheduled with ${data.candidateName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Interview Scheduled</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #101820; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <tr>
                <td>
                  <!-- Logo/Header -->
                  <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background-color: #FEE715; border-radius: 12px; text-align: center; line-height: 60px; font-size: 32px; font-weight: bold; color: #101820; margin-bottom: 16px;">
                      R
                    </div>
                    <h1 style="margin: 0; font-size: 24px; color: #FEE715;">Interview Confirmed</h1>
                  </div>

                  <!-- Main Content Card -->
                  <div style="background: linear-gradient(135deg, rgba(254, 231, 21, 0.1) 0%, rgba(16, 24, 32, 0.5) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(254, 231, 21, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Hello <strong>${data.employerName}</strong>,
                    </p>

                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Your interview with <strong>${data.candidateName}</strong> has been scheduled. A Google Meet link has been created and sent to both parties.
                    </p>

                    <!-- Interview Details -->
                    <div style="background-color: rgba(31, 41, 55, 0.6); border-left: 4px solid #FEE715; border-radius: 8px; padding: 20px; margin: 24px 0;">
                      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #FEE715;">Interview Details</h2>

                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #9CA3AF;">📅 Date & Time:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${formattedDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #9CA3AF;">⏱️ Duration:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${data.duration} minutes</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #9CA3AF;">👤 Candidate:</td>
                          <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${data.candidateName}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Join Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${data.meetingLink}" style="display: inline-block; background-color: #FEE715; color: #101820; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        📹 Join Google Meet
                      </a>
                    </div>

                    <p style="font-size: 14px; line-height: 1.6; color: #9CA3AF; margin: 24px 0 0 0;">
                      💡 <strong>Reminder:</strong> After the interview, remember to update the candidate's status (Approve/Reject) in your dashboard.
                    </p>
                  </div>

                  <!-- Footer -->
                  <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(254, 231, 21, 0.2);">
                    <p style="font-size: 14px; color: #9CA3AF; margin: 0 0 8px 0;">
                      This interview was scheduled through Ready HR
                    </p>
                    <p style="font-size: 12px; color: #6B7280; margin: 0;">
                      Automated interview coordination service
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Error sending employer invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Check if email service is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
