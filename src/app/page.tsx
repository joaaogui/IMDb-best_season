import Image from "next/image";
import { SearchTitle } from "@/components/search-title";
import { ThemeToggle } from "@/components/theme-toggle";

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
            <Image
              src="/images/logo.png"
              alt="IMDb Best Season"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Find the <span className="text-gold">Best Season</span>
            </h1>
            <p className="text-muted-foreground">
              Discover which season of your favorite TV show is the highest rated according to IMDb
            </p>
          </div>

          {/* Search */}
          <div
            className="flex justify-center animate-fade-in"
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
              <span className="text-foreground font-medium">Breaking Bad</span>,{" "}
              <span className="text-foreground font-medium">Game of Thrones</span>, or{" "}
              <span className="text-foreground font-medium">The Office</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>
          Powered by{" "}
          <a
            href="https://www.omdbapi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            OMDb API
          </a>
        </p>
      </footer>
    </main>
  );
}


