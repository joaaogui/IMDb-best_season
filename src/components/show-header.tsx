"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchTitle } from "@/components/search-title";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Show } from "@/types/omdb";

interface ShowHeaderProps {
  show: Show;
  searchQuery: string;
}

export function ShowHeader({ show, searchQuery }: ShowHeaderProps) {
  return (
    <header className="border-b bg-card/30 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/logo.png"
              alt="IMDb Best Season"
              width={80}
              height={50}
              className="hover:opacity-80 transition-opacity"
              priority
            />
          </Link>
          <div className="flex-1">
            <SearchTitle initialValue={searchQuery} compact />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function ShowInfo({ show }: { show: Show }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in">
      {show.imageUrl && (
        <div className="shrink-0 mx-auto md:mx-0">
          <div className="relative w-48 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50">
            <Image
              src={show.imageUrl}
              alt={show.name || "Show poster"}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}
      <div className="flex flex-col justify-center text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {show.name}
        </h1>
        {show.description && (
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            {show.description}
          </p>
        )}
        {show.totalSeasons && (
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-semibold text-gold">{show.totalSeasons}</span>{" "}
            {show.totalSeasons === 1 ? "season" : "seasons"} ranked by IMDb ratings
          </p>
        )}
      </div>
    </div>
  );
}

