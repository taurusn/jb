import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Google Calendar Service
 * Handles Google Meet link generation for interviews
 */

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{ email: string }>;
  conferenceData: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
}

interface CreateMeetingParams {
  candidateName: string;
  candidateEmail: string;
  employerName: string;
  employerEmail: string;
  meetingDate: Date;
  durationMinutes: number;
}

interface MeetingResult {
  success: boolean;
  meetingLink?: string;
  eventId?: string;
  error?: string;
}

/**
 * Initialize OAuth2 client with credentials
 */
function getOAuth2Client(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth credentials in environment variables');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Set refresh token if available
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
  }

  return oauth2Client;
}

/**
 * Generate authorization URL for OAuth flow
 * Admin uses this once to authorize the app
 */
export function getAuthorizationUrl(): string {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force to get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * Called from OAuth callback route
 */
export async function getTokensFromCode(code: string): Promise<{
  success: boolean;
  refreshToken?: string;
  error?: string;
}> {
  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return {
        success: false,
        error: 'No refresh token received. Try revoking access and authorizing again.',
      };
    }

    return {
      success: true,
      refreshToken: tokens.refresh_token,
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to exchange code for tokens',
    };
  }
}

/**
 * Create Google Calendar event with Meet link
 */
export async function createInterviewMeeting(
  params: CreateMeetingParams
): Promise<MeetingResult> {
  try {
    const oauth2Client = getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Calculate end time
    const endDate = new Date(params.meetingDate.getTime() + params.durationMinutes * 60000);

    // Generate unique request ID for conference
    const requestId = `interview-${Date.now()}`;

    const event: CalendarEvent = {
      summary: `Interview: ${params.candidateName} & ${params.employerName}`,
      description: `Job Platform Interview\n\nCandidate: ${params.candidateName}\nEmployer: ${params.employerName}\n\nThis meeting was automatically scheduled through Job Platform.`,
      start: {
        dateTime: params.meetingDate.toISOString(),
        timeZone: 'Asia/Riyadh', // Saudi Arabia timezone
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Asia/Riyadh',
      },
      attendees: [
        { email: params.candidateEmail },
        { email: params.employerEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: requestId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    // Create event with conference (Meet link)
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send email invitations to attendees
    });

    const meetingLink = response.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video'
    )?.uri;

    if (!meetingLink) {
      return {
        success: false,
        error: 'Failed to generate Google Meet link',
      };
    }

    return {
      success: true,
      meetingLink: meetingLink,
      eventId: response.data.id || undefined,
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);

    if (error instanceof Error) {
      // Check for specific Google API errors
      if (error.message.includes('invalid_grant')) {
        return {
          success: false,
          error: 'Google OAuth token expired. Please re-authorize the application.',
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create meeting',
    };
  }
}

/**
 * Delete Google Calendar event
 * Called when meeting link should be removed after meeting ends
 */
export async function deleteMeetingEvent(eventId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const oauth2Client = getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'none', // Don't send cancellation emails
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete event',
    };
  }
}

/**
 * Check if Google Calendar is properly configured
 */
export function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}
