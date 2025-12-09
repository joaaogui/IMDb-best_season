"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchTitleProps {
  initialValue?: string;
  compact?: boolean;
}

export function SearchTitle({ initialValue = "", compact = false }: SearchTitleProps) {
  const [seriesName, setSeriesName] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!seriesName.trim()) return;

    setIsLoading(true);
    router.push(`/${encodeURIComponent(seriesName.trim())}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
        <Input
          type="text"
          placeholder="Enter the show name..."
          value={seriesName}
          onChange={(e) => setSeriesName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className={`pl-9 ${
            compact
              ? "h-9 text-sm"
              : "h-12 text-base"
          } bg-card/50 border-border/50 focus:border-gold focus:ring-gold/20`}
        />
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


