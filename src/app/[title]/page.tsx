"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ShowHeader, ShowInfo } from "@/components/show-header";
import { SeasonsTable } from "@/components/seasons-table";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { searchShow } from "@/lib/api";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SeasonsPage() {
  const params = useParams();
  const title = decodeURIComponent(params.title as string);

  const { data, isLoading, error } = useQuery({
    queryKey: ["show", title],
    queryFn: () => searchShow(title),
    enabled: !!title,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <ShowHeader
          show={{ imageUrl: null, name: null, description: null, imdbID: null, totalSeasons: null }}
          searchQuery={title}
        />
        <main className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <ShowHeader
          show={{ imageUrl: null, name: null, description: null, imdbID: null, totalSeasons: null }}
          searchQuery={title}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Show Not Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {error instanceof Error
                ? error.message
                : `We couldn't find a TV series called "${title}". Please try a different search.`}
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ShowHeader show={data.show} searchQuery={title} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <ShowInfo show={data.show} />
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Season Rankings
            <span className="text-sm font-normal text-muted-foreground">
              (by average episode rating)
            </span>
          </h2>
          <SeasonsTable seasons={data.rankedSeasons} />
        </section>
      </main>
    </div>
  );
}


