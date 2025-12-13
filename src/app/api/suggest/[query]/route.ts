import { NextResponse } from "next/server";
import type { OMDBSearchItem, OMDBSearchResponse } from "@/types/omdb";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { validateTitle, getSafeErrorMessage } from "@/lib/validation";
import { getFromCache, setInCache, getSuggestCacheKey } from "@/lib/cache";

const OMDB_BASE_URL = "https://www.omdbapi.com";

// CORS headers for the API
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

async function fetchFromOMDB(params: string): Promise<Response> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OMDB API key not configured. Get your free key at https://www.omdbapi.com/apikey.aspx"
    );
  }
  return fetch(`${OMDB_BASE_URL}/?${params}&apikey=${apiKey}`);
}

async function suggestSeries(query: string): Promise<OMDBSearchItem[]> {
  const cacheKey = getSuggestCacheKey(query);
  const cached = getFromCache<OMDBSearchItem[]>(cacheKey);
  if (cached) return cached;

  const response = await fetchFromOMDB(
    `s=${encodeURIComponent(query)}&type=series&page=1`
  );
  const data = (await response.json()) as OMDBSearchResponse;

  if (data.Error) {
    // "Movie not found!" is a common OMDb error for no results
    if (data.Error.toLowerCase().includes("not found")) {
      setInCache(cacheKey, []);
      return [];
    }
    throw new Error(data.Error);
  }

  const items = (data.Search || []).filter((item) => item.Type === "series");
  setInCache(cacheKey, items);
  return items;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ query: string }> }
) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(
      `suggest:${clientIp}`,
      RATE_LIMITS.suggest
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": String(rateLimitResult.retryAfter || 60),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
          },
        }
      );
    }

    const { query } = await params;

    // Reuse title validation (same allowed chars / length); "title" is just the query string here.
    const validation = validateTitle(query);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: corsHeaders }
      );
    }

    const results = await suggestSeries(validation.sanitized!);

    return NextResponse.json(results, {
      headers: {
        ...corsHeaders,
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        // Cache suggestions for 1 hour at the CDN; server-side memory cache is longer-lived.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Suggest error:", error);
    return NextResponse.json(
      { error: getSafeErrorMessage(error, "Failed to fetch suggestions") },
      { status: 500, headers: corsHeaders }
    );
  }
}


