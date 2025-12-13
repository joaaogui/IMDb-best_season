"use client";

import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OMDBSearchItem } from "@/types/omdb";

interface SearchTitleProps {
  initialValue?: string;
  compact?: boolean;
}

export function SearchTitle({ initialValue = "", compact = false }: Readonly<SearchTitleProps>) {
  const [seriesName, setSeriesName] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<OMDBSearchItem[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedValueRef = useRef<string | null>(null);
  const router = useRouter();

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!seriesName.trim()) return;

    const committed = seriesName.trim();
    committedValueRef.current = committed;
    setIsOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    setIsLoading(true);
    router.push(`/${encodeURIComponent(committed)}`);
  };

  const normalizedQuery = useMemo(() => seriesName.trim(), [seriesName]);

  useEffect(() => {
    if (closeTimerRef.current) {
      globalThis.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    // Only autocomplete while the input is focused. This prevents the dropdown
    // from showing on result pages where the input is pre-filled via initialValue.
    if (!isFocused || isLoading) {
      abortRef.current?.abort();
      setIsSuggestLoading(false);
      setIsOpen(false);
      return;
    }

    // If we just committed this exact value (submit/select), keep dropdown closed
    if (committedValueRef.current && normalizedQuery === committedValueRef.current) {
      abortRef.current?.abort();
      setIsSuggestLoading(false);
      setIsOpen(false);
      return;
    }

    // Don’t autocomplete on very short strings
    if (normalizedQuery.length < 2) {
      abortRef.current?.abort();
      setSuggestions([]);
      setIsSuggestLoading(false);
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    setIsSuggestLoading(true);
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const timer = globalThis.setTimeout(async () => {
      try {
        // NOTE: suggestShows uses fetch; AbortController support is not plumbed through there.
        // To keep behavior consistent, we abort via controller and ignore AbortError below.
        const res = await fetch(`/api/suggest/${encodeURIComponent(normalizedQuery)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setSuggestions([]);
          setIsOpen(false);
          return;
        }
        const data = (await res.json()) as OMDBSearchItem[];
        const sliced = data.slice(0, 8);
        setSuggestions(sliced);
        setIsOpen(sliced.length > 0);
        setHighlightedIndex(sliced.length ? 0 : -1);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsSuggestLoading(false);
      }
    }, 300);

    return () => globalThis.clearTimeout(timer);
  }, [normalizedQuery, isFocused, isLoading]);

  const selectSuggestion = (item: OMDBSearchItem) => {
    const next = item.Title;
    committedValueRef.current = next;
    setSeriesName(next);
    setIsOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    setIsLoading(true);
    router.push(`/${encodeURIComponent(next)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (!isOpen && suggestions.length > 0) setIsOpen(true);
      if (suggestions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      }
      return;
    }
    if (e.key === "ArrowUp") {
      if (suggestions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      }
      return;
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightedIndex]);
        return;
      }
      handleSearch();
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`flex gap-2 w-full ${compact ? "max-w-md" : "max-w-xl"}`}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {isSuggestLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <Input
          type="text"
          name="search"
          autoComplete="off"
          placeholder="Enter the show name..."
          value={seriesName}
          onChange={(e) => {
            const next = e.target.value;
            if (committedValueRef.current && next.trim() !== committedValueRef.current) {
              committedValueRef.current = null;
            }
            setSeriesName(next);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Let click events on suggestions land before closing
            closeTimerRef.current = globalThis.setTimeout(() => {
              setIsOpen(false);
              setHighlightedIndex(-1);
            }, 120);
          }}
          disabled={isLoading}
          className={`pl-9 ${isSuggestLoading ? "pr-10" : ""} ${
            compact
              ? "h-9 text-sm"
              : "h-12 text-base"
          } bg-card/50 border-border/50 focus:border-gold focus:ring-gold/20`}
        />

        {/* Suggestions dropdown */}
        {isOpen && (isSuggestLoading || suggestions.length > 0) && (
          <div
            className="absolute left-0 right-0 top-full mt-2 rounded-md border border-border/50 bg-card/95 backdrop-blur-sm shadow-xl z-[900] overflow-hidden"
          >
            {isSuggestLoading && suggestions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading…</span>
              </div>
            ) : (
              <ul>
                {suggestions.slice(0, 8).map((item, idx) => {
                  const isActive = idx === highlightedIndex;
                  return (
                    <li key={item.imdbID}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(item)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between gap-3 transition-colors ${
                          isActive ? "bg-muted/60" : "hover:bg-muted/40"
                        }`}
                      >
                        <span className="truncate font-medium">
                          {item.Title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {item.Year}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
      <Button
        type="submit"
        disabled={isLoading || !seriesName.trim()}
        className={`${
          compact ? "h-9 px-4" : "h-12 px-6"
        } gradient-gold text-black font-semibold hover:opacity-90 transition-opacity`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Search"
        )}
      </Button>
    </form>
  );
}


