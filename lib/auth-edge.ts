import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  allowNewApplications: boolean;
}

// Cache for platform settings to avoid repeated database calls
let settingsCache: PlatformSettings | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

/**
 * Verify JWT token using jose (Edge Runtime compatible)
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Extract our custom fields from the payload
    if (payload.userId && payload.email && payload.role) {
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    }
    
    return null;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Generate JWT token using jose (Edge Runtime compatible)
 */
export async function generateTokenEdge(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return jwt;
}

/**
 * Get platform settings with caching (Edge Runtime compatible)
 * Uses fetch to call the API endpoint instead of direct database access
 * @param requestUrl - Optional request URL to construct the API endpoint URL
 */
export async function getPlatformSettingsEdge(requestUrl?: string): Promise<PlatformSettings> {
  const now = Date.now();

  // Return cached settings if still valid
  if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return settingsCache;
  }

  try {
    // Construct full URL from request URL if provided, otherwise use env var or skip fetch
    let apiUrl: string;
    if (requestUrl) {
      const url = new URL(requestUrl);
      apiUrl = `${url.origin}/api/settings/public`;
    } else if (process.env.NEXT_PUBLIC_BASE_URL) {
      apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/settings/public`;
    } else {
      // No URL available - return safe defaults without fetching
      console.warn('Platform settings fetch skipped: No URL available in Edge Runtime');
      return {
        maintenanceMode: false,
        allowNewRegistrations: true,
        allowNewApplications: true,
      };
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const settings = await response.json();

    // Update cache
    settingsCache = {
      maintenanceMode: settings.maintenanceMode ?? false,
      allowNewRegistrations: settings.allowNewRegistrations ?? true,
      allowNewApplications: settings.allowNewApplications ?? true,
    };
    cacheTimestamp = now;

    return settingsCache;
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    // Return safe defaults if fetch fails
    return {
      maintenanceMode: false,
      allowNewRegistrations: true,
      allowNewApplications: true,
    };
  }
}
