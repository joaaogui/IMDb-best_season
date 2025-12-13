"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EpisodeDialog } from "@/components/episode-dialog";
import { Info, Trophy, ArrowUpDown, Star } from "lucide-react";
import type { RankedSeason } from "@/types/omdb";

interface SeasonsTableProps {
  seasons: RankedSeason[];
}

export function SeasonsTable({ seasons }: Readonly<SeasonsTableProps>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedSeason, setSelectedSeason] = useState<RankedSeason | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: ColumnDef<RankedSeason>[] = [
    {
      id: "rank",
      header: "Rank",
      cell: ({ row }) => {
        const originalIndex = seasons.findIndex(
          (s) => s.seasonNumber === row.original.seasonNumber
        );
        const isFirst = originalIndex === 0;
        return (
          <div className="flex items-center gap-2">
            {isFirst ? (
              <Trophy className="h-5 w-5 text-gold fill-gold" />
            ) : (
              <span className="w-5 text-center text-muted-foreground font-mono">
                {originalIndex + 1}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "seasonNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Season
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold">Season {row.original.seasonNumber}</span>
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rating = row.original.rating;
        const originalIndex = seasons.findIndex(
          (s) => s.seasonNumber === row.original.seasonNumber
        );
        const isFirst = originalIndex === 0;
        return (
          <div className="flex items-center gap-2">
            <Star
              className={`h-4 w-4 ${
                isFirst ? "text-gold fill-gold" : "text-muted-foreground"
              }`}
            />
            <span
              className={`font-mono ${
                isFirst ? "text-gold font-bold" : ""
              }`}
            >
              {rating.toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      id: "episodes",
      header: "Episodes",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.episodes.length} episodes
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedSeason(row.original);
            setDialogOpen(true);
          }}
          className="hover:text-gold"
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">View episodes</span>
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: seasons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <>
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-muted/30">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row, index) => {
              const originalIndex = seasons.findIndex(
                (s) => s.seasonNumber === row.original.seasonNumber
              );
              const isFirst = originalIndex === 0;
              return (
                <TableRow
                  key={row.id}
                  className={`transition-colors ${
                    isFirst
                      ? "bg-gold/5 hover:bg-gold/10 border-l-2 border-l-gold"
                      : "hover:bg-muted/30"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedSeason && (
        <EpisodeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          seasonNumber={selectedSeason.seasonNumber}
          episodes={selectedSeason.episodes}
        />
      )}
    </>
  );
}


