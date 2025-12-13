/**
 * Simple in-memory rate limiter for serverless environments
 * For production with high traffic, consider using Upstash Redis
 * 
 * This implementation uses a sliding window algorithm
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (works per serverless instance)
// For distributed rate limiting, use Redis/Upstash
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given identifier (usually IP address)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Vercel/Cloudflare headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  // Fallback
  return "anonymous";
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // 20 requests per minute for search endpoints
  search: {
    maxRequests: 20,
    windowMs: 60 * 1000,
  },
  // Autocomplete can be slightly higher since it is debounced + cached
  suggest: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
  // 10 requests per minute for heavy endpoints
  heavy: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
} as const;


