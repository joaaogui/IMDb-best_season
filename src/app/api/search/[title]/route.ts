import { NextResponse } from "next/server";
import type {
  OMDBTitle,
  OMDBSeason,
  Show,
  RankedSeason,
  EpisodeRating,
  SearchResult,
} from "@/types/omdb";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { validateTitle, getSafeErrorMessage } from "@/lib/validation";
import {
  getFromCache,
  setInCache,
  getTitleCacheKey,
  getSeasonCacheKey,
} from "@/lib/cache";

const OMDB_BASE_URL = "https://www.omdbapi.com";

// CORS headers for the API
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS request for CORS preflight
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

async function getTitle(title: string): Promise<OMDBTitle> {
  // Check cache first
  const cacheKey = getTitleCacheKey(title);
  const cached = getFromCache<OMDBTitle>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetchFromOMDB(`t=${encodeURIComponent(title)}`);
  const data = await response.json();

  if (data.Error) {
    throw new Error(data.Error);
  }

  // Cache the result
  setInCache(cacheKey, data);
  return data;
}

async function getSeason(imdbID: string, season: number): Promise<OMDBSeason> {
  // Check cache first
  const cacheKey = getSeasonCacheKey(imdbID, season);
  const cached = getFromCache<OMDBSeason>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetchFromOMDB(`i=${imdbID}&Season=${season}`);
  const data = await response.json();

  if (data.Error) {
    throw new Error(data.Error);
  }

  // Cache the result
  setInCache(cacheKey, data);
  return data;
}

function calculateSeasonRating(episodes: OMDBSeason["Episodes"]): {
  rating: number;
  episodeRatings: EpisodeRating[];
} {
  const episodeRatings: EpisodeRating[] = [];
  let totalRating = 0;
  let validEpisodes = 0;

  for (const episode of episodes) {
    const rating = episode.imdbRating;
    episodeRatings.push({
      episode: Number.parseInt(episode.Episode, 10),
      rating: rating,
      title: episode.Title,
    });

    if (rating !== "N/A" && !Number.isNaN(Number.parseFloat(rating))) {
      totalRating += Number.parseFloat(rating);
      validEpisodes++;
    }
  }

  return {
    rating: validEpisodes > 0 ? totalRating / validEpisodes : 0,
    episodeRatings,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ title: string }> }
) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(
      `search:${clientIp}`,
      RATE_LIMITS.search
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

    const { title } = await params;

    // Input validation
    const validation = validateTitle(title);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: corsHeaders }
      );
    }

    const sanitizedTitle = validation.sanitized!;
    const titleData = await getTitle(sanitizedTitle);

    if (titleData.Type !== "series") {
      return NextResponse.json(
        { error: "Please search for a TV series" },
        { status: 400, headers: corsHeaders }
      );
    }

    const show: Show = {
      imageUrl: titleData.Poster === "N/A" ? null : titleData.Poster,
      name: titleData.Title,
      description: titleData.Plot,
      imdbID: titleData.imdbID,
      totalSeasons: titleData.totalSeasons
        ? Number.parseInt(titleData.totalSeasons, 10)
        : null,
    };

    const totalSeasons = show.totalSeasons || 0;
    const seasonPromises: Promise<OMDBSeason>[] = [];

    for (let i = 1; i <= totalSeasons; i++) {
      seasonPromises.push(getSeason(titleData.imdbID, i));
    }

    const seasonsData = await Promise.all(seasonPromises);

    const rankedSeasons: RankedSeason[] = seasonsData.map(
      (seasonData, index) => {
        const { rating, episodeRatings } = calculateSeasonRating(
          seasonData.Episodes
        );
        return {
          seasonNumber: index + 1,
          rating,
          episodes: episodeRatings,
        };
      }
    );

    // Sort by rating descending
    rankedSeasons.sort((a, b) => b.rating - a.rating);

    const result: SearchResult = {
      show,
      rankedSeasons,
    };

    return NextResponse.json(result, {
      headers: {
        ...corsHeaders,
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        // Cache successful responses for 1 hour on CDN
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error: getSafeErrorMessage(error, "Failed to search for show"),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
