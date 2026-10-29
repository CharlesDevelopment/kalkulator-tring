"use client";

import React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { PriceUnitMode } from "@/app/lib/price-storage";
import { formatRupiah, formatTimestampWIB } from "@/app/lib/format";

export interface PriceCardProps {
  buyPrice: number;
  buybackPrice: number;
  unitMode: PriceUnitMode;
  updatedAt: string;
  onChangeUnitMode: (mode: PriceUnitMode) => void;
}

export function PriceCard({
  buyPrice,
  buybackPrice,
  unitMode,
  updatedAt,
  onChangeUnitMode,
}: PriceCardProps) {
  const isPer001 = unitMode === "0.01g";
  const displayBuy = isPer001 ? Math.round(buyPrice / 100) : buyPrice;
  const displayBuyback = isPer001
    ? Math.round(buybackPrice / 100)
    : buybackPrice;

  const spreadDisplay = Math.max(0, displayBuy - displayBuyback);
  const spreadPct = buyPrice > 0 ? ((buyPrice - buybackPrice) / buyPrice) * 100 : 0;

  const unitLabel = isPer001 ? "per 0,01 Gram" : "per 1 Gram";
  const subUnitLabel = isPer001 ? "1 gram" : "0,01 gram";
  const subBuy = isPer001 ? buyPrice : Math.round(buyPrice / 100);
  const subBuyback = isPer001 ? buybackPrice : Math.round(buybackPrice / 100);

  return (
    <Card aria-label="Panel Harga Acuan Emas Tring!">
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground md:text-lg">
              Kurs Acuan Emas Tring!
            </h2>
            <p className="text-xs text-muted">
              Diperbarui:{" "}
              <span className="font-mono tabular-nums text-foreground">
                {updatedAt ? formatTimestampWIB(updatedAt) : "Default"}
              </span>
              {" · "}
              Ubah harga beli & buyback kapan saja melalui halaman Pengaturan Harga.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Pilih mode tampilan satuan gram harga emas"
              className="grid grid-cols-2 gap-1 rounded-md border border-border-control bg-surface-subtle p-1"
            >
              <button
                type="button"
                onClick={() => onChangeUnitMode("0.01g")}
                aria-pressed={isPer001}
                className={`min-h-[36px] rounded px-3 py-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isPer001
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                Per 0,01 Gram
              </button>
              <button
                type="button"
                onClick={() => onChangeUnitMode("1g")}
                aria-pressed={!isPer001}
                className={`min-h-[36px] rounded px-3 py-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  !isPer001
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                Per 1 Gram
              </button>
            </div>

            <Button asChild variant="outline" size="sm">
              <Link href="/settings">
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span>Atur Harga (/settings)</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-surface-subtle p-3.5">
            <span className="text-xs font-semibold text-muted">
              Harga Beli Tring! ({unitLabel})
            </span>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground md:text-2xl">
              {formatRupiah(displayBuy)}
            </p>
            <span className="mt-1 block text-xs text-muted">
              Setara {formatRupiah(subBuy)} / {subUnitLabel}
            </span>
          </div>

          <div className="rounded-md border border-border bg-surface-subtle p-3.5">
            <span className="text-xs font-semibold text-muted">
              Harga Jual / Buyback ({unitLabel})
            </span>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground md:text-2xl">
              {formatRupiah(displayBuyback)}
            </p>
            <span className="mt-1 block text-xs text-muted">
              Setara {formatRupiah(subBuyback)} / {subUnitLabel}
            </span>
          </div>

          <div className="rounded-md border border-border bg-surface-subtle p-3.5 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold text-muted">
              Selisih Spread ({unitLabel})
            </span>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground md:text-2xl">
              {formatRupiah(spreadDisplay)}{" "}
              <span className="text-sm font-semibold text-muted">
                ({spreadPct.toFixed(2).replace(".", ",")}%)
              </span>
            </p>
            <span className="mt-1 block text-xs text-muted">
              Voucher + bonus VA harus melampaui spread ini agar cuan
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
