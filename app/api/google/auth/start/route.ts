import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/google-calendar';

/**
 * Google OAuth Start Route
 * Admin visits this URL once to authorize Google Calendar access
 *
 * @route GET /api/google/auth/start
 */
export async function GET() {
  try {
    const authUrl = getAuthorizationUrl();

    // Redirect to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate authorization URL'
      },
      { status: 500 }
    );
  }
}
