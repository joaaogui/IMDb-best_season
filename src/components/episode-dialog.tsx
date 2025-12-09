"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";
import type { EpisodeRating } from "@/types/omdb";

interface EpisodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonNumber: number;
  episodes: EpisodeRating[];
}

export function EpisodeDialog({
  open,
  onOpenChange,
  seasonNumber,
  episodes,
}: EpisodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Star className="h-5 w-5 text-gold fill-gold" />
            Season {seasonNumber} Episodes
          </DialogTitle>
          <DialogDescription>
            Episode ratings from IMDb
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto flex-1 -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-20 text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {episodes.map((episode) => (
                <TableRow key={episode.episode}>
                  <TableCell className="font-mono text-muted-foreground">
                    {episode.episode}
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[180px]">
                    {episode.title}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        episode.rating !== "N/A"
                          ? parseFloat(episode.rating) >= 8
                            ? "text-gold"
                            : parseFloat(episode.rating) >= 7
                            ? "text-green-500"
                            : "text-muted-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {episode.rating !== "N/A" && (
                        <Star className="h-3 w-3 fill-current" />
                      )}
                      {episode.rating}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

