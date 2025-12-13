import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SearchTitle } from "@/components/search-title";
import { ThemeToggle } from "@/components/theme-toggle";

const SUGGESTIONS = ["Breaking Bad", "Game of Thrones", "The Office"];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl space-y-8 text-center">
          {/* Logo */}
          <div className="relative w-64 h-40 mx-auto animate-scale-in">
            <a
              href="https://imdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative w-full h-full"
              title="Open IMDb"
            >
              <Image
                src="/images/logo.png"
                alt="IMDb Best Season"
                fill
                className="object-contain dark:invert dark:brightness-200 group-hover:scale-105 transition-transform"
                priority
              />
              <ExternalLink className="absolute top-0 right-0 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Tagline */}
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h1 data-testid="main-heading" className="text-2xl md:text-3xl font-bold tracking-tight">
              Find the <span className="text-gold">Best Season</span>
            </h1>
            <p data-testid="tagline" className="text-muted-foreground">
              Discover which season of your favorite TV show is the highest rated according to IMDb
            </p>
          </div>

          {/* Search */}
          <div
            className="relative z-10 flex justify-center animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <SearchTitle />
          </div>

          {/* Hints */}
          <div
            className="text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <p>
              Try searching for{" "}
              {SUGGESTIONS.map((suggestion, index) => (
                <span key={suggestion}>
                  <Link
                    href={`/${encodeURIComponent(suggestion)}`}
                    data-testid={`suggestion-${suggestion.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-foreground font-medium hover:text-gold transition-colors"
                  >
                    {suggestion}
                  </Link>
                  {index < SUGGESTIONS.length - 1 && (index === SUGGESTIONS.length - 2 ? ", or " : ", ")}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer data-testid="footer" className="py-4 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>
          Powered by{" "}
          <a
            href="https://www.omdbapi.com/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="omdb-link"
            className="text-gold hover:underline"
          >
            OMDb API
          </a>
        </p>
      </footer>
    </main>
  );
}


