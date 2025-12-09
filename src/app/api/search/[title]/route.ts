import { NextResponse } from "next/server";
import type {
  OMDBTitle,
  OMDBSeason,
  Show,
  RankedSeason,
  EpisodeRating,
  SearchResult,
} from "@/types/omdb";

const OMDB_BASE_URL = "https://www.omdbapi.com";

async function fetchFromOMDB(params: string): Promise<Response> {
  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("OMDB API key not configured");
  }
  return fetch(`${OMDB_BASE_URL}/?${params}&apikey=${apiKey}`);
}

async function getTitle(title: string): Promise<OMDBTitle> {
  const response = await fetchFromOMDB(`t=${encodeURIComponent(title)}`);
  const data = await response.json();

  if (data.Error) {
    throw new Error(data.Error);
  }

  return data;
}

async function getSeason(imdbID: string, season: number): Promise<OMDBSeason> {
  const response = await fetchFromOMDB(`i=${imdbID}&Season=${season}`);
  const data = await response.json();

  if (data.Error) {
    throw new Error(data.Error);
  }

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
      episode: parseInt(episode.Episode, 10),
      rating: rating,
      title: episode.Title,
    });

    if (rating !== "N/A" && !isNaN(parseFloat(rating))) {
      totalRating += parseFloat(rating);
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
    const { title } = await params;

    if (!title) {
      return NextResponse.json(
        { error: "Title parameter is required" },
        { status: 400 }
      );
    }

    const titleData = await getTitle(title);

    if (titleData.Type !== "series") {
      return NextResponse.json(
        { error: "Please search for a TV series" },
        { status: 400 }
      );
    }

    const show: Show = {
      imageUrl: titleData.Poster !== "N/A" ? titleData.Poster : null,
      name: titleData.Title,
      description: titleData.Plot,
      imdbID: titleData.imdbID,
      totalSeasons: titleData.totalSeasons
        ? parseInt(titleData.totalSeasons, 10)
        : null,
    };

    const totalSeasons = show.totalSeasons || 0;
    const seasonPromises: Promise<OMDBSeason>[] = [];

    for (let i = 1; i <= totalSeasons; i++) {
      seasonPromises.push(getSeason(titleData.imdbID, i));
    }

    const seasonsData = await Promise.all(seasonPromises);

    const rankedSeasons: RankedSeason[] = seasonsData.map((seasonData, index) => {
      const { rating, episodeRatings } = calculateSeasonRating(
        seasonData.Episodes
      );
      return {
        seasonNumber: index + 1,
        rating,
        episodes: episodeRatings,
      };
    });

    // Sort by rating descending
    rankedSeasons.sort((a, b) => b.rating - a.rating);

    const result: SearchResult = {
      show,
      rankedSeasons,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to search for show",
      },
      { status: 500 }
    );
  }
}


