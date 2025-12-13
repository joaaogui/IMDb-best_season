import type { SearchResult, OMDBSearchItem } from "@/types/omdb";

export async function searchShow(title: string): Promise<SearchResult> {
  const response = await fetch(`/api/search/${encodeURIComponent(title)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to search for show");
  }

  return response.json();
}

export async function suggestShows(query: string): Promise<OMDBSearchItem[]> {
  const response = await fetch(`/api/suggest/${encodeURIComponent(query)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch suggestions");
  }

  return response.json();
}


