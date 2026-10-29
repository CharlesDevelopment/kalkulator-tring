"use client";

import React from "react";
import { RefreshCw, SlidersHorizontal, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  formatRupiah,
  formatThousandSeparator,
  parseDigitsToNumber,
  formatTimestampWIB,
} from "@/app/lib/format";

export interface PriceCardProps {
  buyPrice: number;
  buybackPrice: number;
  isLive: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  sourceName: string;
  updatedAt: string;
  isManualOverride: boolean;
  onRefresh: () => void;
  onToggleManualOverride: (enabled: boolean) => void;
  onChangeBuyPrice: (newPrice: number) => void;
  onChangeBuybackPrice: (newPrice: number) => void;
}

export function PriceCard({
  buyPrice,
  buybackPrice,
  isLive,
  isLoading,
  errorMessage,
  sourceName,
  updatedAt,
  isManualOverride,
  onRefresh,
  onToggleManualOverride,
  onChangeBuyPrice,
  onChangeBuybackPrice,
}: PriceCardProps) {
  const spreadRp = Math.max(0, buyPrice - buybackPrice);
  const spreadPct = buyPrice > 0 ? (spreadRp / buyPrice) * 100 : 0;

  return (
    <Card aria-label="Panel Harga Acuan Emas Tring! Pegadaian">
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base font-bold text-foreground md:text-lg">
                Kurs Emas Tring! by Pegadaian
              </h2>

              {isLoading ? (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border-control bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-foreground"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Memuat Harga Terbaru...
                </span>
              ) : isManualOverride ? (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 rounded-md border border-warn-border bg-warn-bg px-2.5 py-1 text-xs font-semibold text-warn-text"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Mode Override Manual Aktif
                </span>
              ) : isLive ? (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 rounded-md border border-profit-border bg-profit-bg px-2.5 py-1 text-xs font-semibold text-profit-text"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Live Price Update
                </span>
              ) : (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 rounded-md border border-warn-border bg-warn-bg px-2.5 py-1 text-xs font-semibold text-warn-text"
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Harga Acuan Cadangan
                </span>
              )}
            </div>

            <p className="text-xs text-muted">
              Sumber: <span className="font-medium text-foreground">{sourceName}</span>
              {" · "}
              Update terakhir:{" "}
              <span className="font-mono tabular-nums text-foreground">
                {updatedAt ? formatTimestampWIB(updatedAt) : "Belum disinkronkan"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Segarkan harga emas dari server Pegadaian"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>Segarkan Kurs</span>
            </Button>

            <Button
              type="button"
              variant={isManualOverride ? "default" : "subtle"}
              size="sm"
              onClick={() => onToggleManualOverride(!isManualOverride)}
              aria-pressed={isManualOverride}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>
                {isManualOverride ? "Kunci Kurs Manual" : "Ubah Harga Manual"}
              </span>
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-md border border-warn-border bg-warn-bg p-3 text-xs text-warn-text"
          >
            <p className="font-semibold">Pemberitahuan Koneksi Kurs:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-surface-subtle p-3.5">
            <span className="text-xs font-semibold text-muted">
              Harga Beli Tring! (per 1 Gram)
            </span>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground md:text-2xl">
              {formatRupiah(buyPrice)}
            </p>
            <span className="mt-1 block text-xs text-muted">
              Setara {formatRupiah(Math.round(buyPrice / 100))} / 0,01 gram
            </span>
          </div>

          <div className="rounded-md border border-border bg-surface-subtle p-3.5">
            <span className="text-xs font-semibold text-muted">
              Harga Jual / Buyback (per 1 Gram)
            </span>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground md:text-2xl">
              {formatRupiah(buybackPrice)}
            </p>
            <span className="mt-1 block text-xs text-muted">
              Setara {formatRupiah(Math.round(buybackPrice / 100))} / 0,01 gram
            </span>
          </div>

          <div className="rounded-md border border-border bg-surface-subtle p-3.5 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold text-muted">
              Selisih Spread Beli vs Buyback
            </span>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-foreground md:text-2xl">
              {formatRupiah(spreadRp)}{" "}
              <span className="text-sm font-semibold text-muted">
                ({spreadPct.toFixed(2).replace(".", ",")}%)
              </span>
            </p>
            <span className="mt-1 block text-xs text-muted">
              Diskon voucher harus melampaui spread ini agar langsung cuan
            </span>
          </div>
        </div>

        {isManualOverride && (
          <div className="rounded-md border border-border-control bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">
                Input Override Harga Emas Manual (per 1 Gram)
              </p>
              <span className="text-xs text-muted">
                Sesuaikan dengan angka di aplikasi Tring! saat ini
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="manual-buy-price">
                  Harga Beli Emas (Rp / gram)
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-semibold text-muted">
                    Rp
                  </span>
                  <Input
                    id="manual-buy-price"
                    type="text"
                    inputMode="numeric"
                    className="pl-10"
                    placeholder="Contoh: 1.545.000"
                    value={formatThousandSeparator(buyPrice)}
                    onChange={(e) =>
                      onChangeBuyPrice(parseDigitsToNumber(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-buyback-price">
                  Harga Jual / Buyback (Rp / gram)
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-semibold text-muted">
                    Rp
                  </span>
                  <Input
                    id="manual-buyback-price"
                    type="text"
                    inputMode="numeric"
                    className="pl-10"
                    placeholder="Contoh: 1.495.000"
                    value={formatThousandSeparator(buybackPrice)}
                    onChange={(e) =>
                      onChangeBuybackPrice(parseDigitsToNumber(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
