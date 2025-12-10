/**
 * Simple in-memory cache for OMDB responses
 * OMDB data is relatively static, so caching is safe and reduces API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache storage
const cache = new Map<string, CacheEntry<unknown>>();

// Default TTL: 24 hours (OMDB data doesn't change frequently)
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

// Maximum cache size to prevent memory issues
const MAX_CACHE_SIZE = 1000;

/**
 * Get item from cache
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Set item in cache
 */
export function setInCache<T>(key: string, data: T): void {
  // Evict oldest entries if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Generate cache key for title search
 */
export function getTitleCacheKey(title: string): string {
  return `title:${title.toLowerCase().trim()}`;
}

/**
 * Generate cache key for season data
 */
export function getSeasonCacheKey(imdbId: string, season: number): string {
  return `season:${imdbId}:${season}`;
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; maxSize: number } {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}

