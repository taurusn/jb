import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

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
