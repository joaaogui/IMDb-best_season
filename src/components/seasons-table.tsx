"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  type CellContext,
  type HeaderContext,
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

interface TableMeta {
  seasons: RankedSeason[];
  onViewEpisodes: (season: RankedSeason) => void;
}

function RankCellRenderer({ row, table }: Readonly<CellContext<RankedSeason, unknown>>) {
  const meta = table.options.meta as TableMeta;
  const seasonNumber = row.original.seasonNumber;
  const originalIndex = meta.seasons.findIndex((s) => s.seasonNumber === seasonNumber);
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
}

function SortableSeasonHeader({ column }: Readonly<HeaderContext<RankedSeason, unknown>>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-4"
    >
      Season
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

function SortableRatingHeader({ column }: Readonly<HeaderContext<RankedSeason, unknown>>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-4"
    >
      Rating
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

function SeasonCellRenderer({ row }: Readonly<CellContext<RankedSeason, unknown>>) {
  return <span data-testid={`season-number-${row.original.seasonNumber}`} className="font-semibold">Season {row.original.seasonNumber}</span>;
}

function RatingCellRenderer({ row, table }: Readonly<CellContext<RankedSeason, unknown>>) {
  const meta = table.options.meta as TableMeta;
  const { rating, seasonNumber } = row.original;
  const originalIndex = meta.seasons.findIndex((s) => s.seasonNumber === seasonNumber);
  const isFirst = originalIndex === 0;
  return (
    <div className="flex items-center gap-2">
      <Star
        className={`h-4 w-4 ${
          isFirst ? "text-gold fill-gold" : "text-muted-foreground"
        }`}
      />
      <span data-testid={`season-rating-${seasonNumber}`} className={`font-mono ${isFirst ? "text-gold font-bold" : ""}`}>
        {rating.toFixed(2)}
      </span>
    </div>
  );
}

function EpisodesCellRenderer({ row }: Readonly<CellContext<RankedSeason, unknown>>) {
  return (
    <span className="text-muted-foreground">{row.original.episodes.length} episodes</span>
  );
}

function ActionsCellRenderer({ row, table }: Readonly<CellContext<RankedSeason, unknown>>) {
  const meta = table.options.meta as TableMeta;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => meta.onViewEpisodes(row.original)}
      className="hover:text-gold"
    >
      <Info className="h-4 w-4" />
      <span className="sr-only">View episodes</span>
    </Button>
  );
}

const columns: ColumnDef<RankedSeason>[] = [
  {
    id: "rank",
    header: "Rank",
    cell: RankCellRenderer,
  },
  {
    accessorKey: "seasonNumber",
    header: SortableSeasonHeader,
    cell: SeasonCellRenderer,
  },
  {
    accessorKey: "rating",
    header: SortableRatingHeader,
    cell: RatingCellRenderer,
  },
  {
    id: "episodes",
    header: "Episodes",
    cell: EpisodesCellRenderer,
  },
  {
    id: "actions",
    header: "",
    cell: ActionsCellRenderer,
  },
];

export function SeasonsTable({ seasons }: Readonly<SeasonsTableProps>) {
  if (seasons.length === 0) {
    return <div data-testid="seasons-table-empty">No seasons found</div>;
  }
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedSeason, setSelectedSeason] = useState<RankedSeason | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewEpisodes = useCallback((season: RankedSeason) => {
    setSelectedSeason(season);
    setDialogOpen(true);
  }, []);

  const tableMeta: TableMeta = useMemo(
    () => ({
      seasons,
      onViewEpisodes: handleViewEpisodes,
    }),
    [seasons, handleViewEpisodes]
  );

  const table = useReactTable({
    data: seasons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    meta: tableMeta,
  });

  return (
    <>
      <div data-testid="seasons-table" className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
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
                  data-testid={`season-row-${row.original.seasonNumber}`}
                  data-best-season={isFirst ? "true" : undefined}
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


