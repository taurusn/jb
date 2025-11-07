import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-calendar';

/**
 * Google OAuth Callback Route
 * Google redirects here after authorization
 * Exchanges code for refresh token
 *
 * @route GET /api/google/auth/callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Failed</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #101820;
                color: #ffffff;
              }
              .container {
                text-align: center;
                padding: 2rem;
                max-width: 500px;
              }
              .error {
                color: #EF4444;
                font-size: 1.5rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">❌ Authorization Failed</div>
              <p>Error: ${error}</p>
              <p>Please try again or contact support.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }

    // No code received
    if (!code) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Request</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #101820;
                color: #ffffff;
              }
              .container {
                text-align: center;
                padding: 2rem;
                max-width: 500px;
              }
              .error {
                color: #EF4444;
                font-size: 1.5rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">❌ Invalid Request</div>
              <p>No authorization code received from Google.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }

    // Exchange code for tokens
    const result = await getTokensFromCode(code);

    if (!result.success || !result.refreshToken) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Token Exchange Failed</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #101820;
                color: #ffffff;
              }
              .container {
                text-align: center;
                padding: 2rem;
                max-width: 500px;
              }
              .error {
                color: #EF4444;
                font-size: 1.5rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">❌ Token Exchange Failed</div>
              <p>${result.error || 'Failed to get refresh token'}</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 500,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }

    // Success! Display refresh token to admin
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #101820;
              color: #ffffff;
            }
            .container {
              text-align: center;
              padding: 2rem;
              max-width: 600px;
            }
            .success {
              color: #10B981;
              font-size: 1.5rem;
              margin-bottom: 1rem;
            }
            .token-box {
              background: #1F2937;
              border: 2px solid #FEE715;
              border-radius: 8px;
              padding: 1.5rem;
              margin: 2rem 0;
              word-break: break-all;
              font-family: monospace;
              font-size: 0.875rem;
            }
            .instructions {
              text-align: left;
              background: #1F2937;
              border-radius: 8px;
              padding: 1.5rem;
              margin-top: 2rem;
            }
            .instructions ol {
              padding-left: 1.5rem;
            }
            .instructions li {
              margin-bottom: 0.5rem;
            }
            .copy-btn {
              background: #FEE715;
              color: #101820;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              margin-top: 1rem;
            }
            .copy-btn:hover {
              background: #E5D013;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Authorization Successful!</div>
            <p>Your Google Calendar API refresh token:</p>

            <div class="token-box" id="token">
              ${result.refreshToken}
            </div>

            <button class="copy-btn" onclick="copyToken()">
              📋 Copy Token
            </button>

            <div class="instructions">
              <h3 style="color: #FEE715; margin-top: 0;">Next Steps:</h3>
              <ol>
                <li>Copy the refresh token above</li>
                <li>Open your <code>.env</code> file</li>
                <li>Find <code>GOOGLE_REFRESH_TOKEN=""</code></li>
                <li>Paste the token between the quotes</li>
                <li>Restart your development server</li>
                <li>For production: Add to Vercel environment variables</li>
              </ol>
              <p style="margin-top: 1rem; color: #9CA3AF;">
                ⚠️ Keep this token secure! It grants access to your Google Calendar.
              </p>
            </div>
          </div>

          <script>
            function copyToken() {
              const token = document.getElementById('token').textContent.trim();
              navigator.clipboard.writeText(token).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = '✅ Copied!';
                setTimeout(() => {
                  btn.textContent = '📋 Copy Token';
                }, 2000);
              });
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during OAuth callback',
      },
      { status: 500 }
    );
  }
}
