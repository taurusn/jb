/**
 * Simple In-Memory Rate Limiting
 * For production, use Redis-based solution (Upstash, Vercel KV, etc.)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  max: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Get or create entry
  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }

  const entry = store[key];

  // Increment count
  entry.count++;

  const remaining = Math.max(0, config.max - entry.count);
  const isAllowed = entry.count <= config.max;

  return {
    success: isAllowed,
    limit: config.max,
    remaining,
    reset: entry.resetAt,
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Login attempts: 5 per 15 minutes
  login: {
    max: 5,
    windowMs: 15 * 60 * 1000,
  },

  // Registration: 3 per hour
  register: {
    max: 3,
    windowMs: 60 * 60 * 1000,
  },

  // Employee submission: 3 per hour per IP
  employeeSubmit: {
    max: 3,
    windowMs: 60 * 60 * 1000,
  },

  // General API: 100 requests per 15 minutes
  api: {
    max: 100,
    windowMs: 15 * 60 * 1000,
  },

  // Admin API: 200 requests per 15 minutes
  adminApi: {
    max: 200,
    windowMs: 15 * 60 * 1000,
  },
};

/**
 * Get client identifier from request
 * Uses IP address and user agent as identifier
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  // Include user agent for better uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Hash to create consistent identifier
  return `${ip}-${userAgent.slice(0, 50)}`;
}
