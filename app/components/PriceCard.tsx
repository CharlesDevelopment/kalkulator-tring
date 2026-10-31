"use client";

import React, { useState } from "react";
import { SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { PriceUnitMode } from "@/app/lib/price-storage";
import {
  formatRupiah,
  formatThousandSeparator,
  parseDigitsToNumber,
  formatTimestampWIB,
} from "@/app/lib/format";

export interface PriceCardProps {
  buyPrice: number;
  buybackPrice: number;
  unitMode: PriceUnitMode;
  updatedAt: string;
  isLocalOverride: boolean;
  onChangeUnitMode: (mode: PriceUnitMode) => void;
  onSaveLocalPrice: (newBuyPerGram: number, newBuybackPerGram: number) => void;
  onResetToUniversal: () => void;
}

export function PriceCard({
  buyPrice,
  buybackPrice,
  unitMode,
  updatedAt,
  isLocalOverride,
  onChangeUnitMode,
  onSaveLocalPrice,
  onResetToUniversal,
}: PriceCardProps) {
  const [isEditingLocal, setIsEditingLocal] = useState(false);

  const isPer001 = unitMode === "0.01g";
  const displayBuy = isPer001 ? Math.round(buyPrice / 100) : buyPrice;
  const displayBuyback = isPer001
    ? Math.round(buybackPrice / 100)
    : buybackPrice;

  const spreadDisplay = Math.max(0, displayBuy - displayBuyback);
  const spreadPct =
    buyPrice > 0 ? ((buyPrice - buybackPrice) / buyPrice) * 100 : 0;

  const unitLabel = isPer001 ? "per 0,01 Gram" : "per 1 Gram";
  const subUnitLabel = isPer001 ? "1 gram" : "0,01 gram";
  const subBuy = isPer001 ? buyPrice : Math.round(buyPrice / 100);
  const subBuyback = isPer001 ? buybackPrice : Math.round(buybackPrice / 100);

  const handleLocalBuyChange = (rawDigits: number) => {
    const nextPerGram = Math.min(100_000_000, isPer001 ? rawDigits * 100 : rawDigits);
    onSaveLocalPrice(nextPerGram, buybackPrice);
  };

  const handleLocalBuybackChange = (rawDigits: number) => {
    const nextPerGram = Math.min(100_000_000, isPer001 ? rawDigits * 100 : rawDigits);
    onSaveLocalPrice(buyPrice, nextPerGram);
  };

  return (
    <Card aria-label="Panel Harga Acuan Emas Tring!">
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-foreground md:text-lg">
                Kurs Acuan Emas Tring!
              </h2>

              {isLocalOverride ? (
                <span className="inline-flex items-center gap-1 rounded border border-warn-border bg-warn-bg px-2 py-0.5 text-xs font-bold text-warn-text">
                  Mode Harga Lokal (Device Ini)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded border border-profit-border bg-profit-bg px-2 py-0.5 text-xs font-bold text-profit-text">
                  Harga Universal Aktif
                </span>
              )}
            </div>

            <p className="text-xs text-muted">
              Diperbarui:{" "}
              <span className="font-mono tabular-nums text-foreground">
                {updatedAt ? formatTimestampWIB(updatedAt) : "Terbaru"}
              </span>
              {" · "}
              {isLocalOverride
                ? "Anda sedang menggunakan harga khusus di perangkat ini."
                : "Mengikuti harga universal yang telah ditetapkan."}
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

            <Button
              type="button"
              variant={isEditingLocal ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditingLocal(!isEditingLocal)}
              aria-expanded={isEditingLocal}
            >
              {isEditingLocal ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Selesai Ubah Lokal</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  <span>Sesuaikan Harga Lokal</span>
                </>
              )}
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

        {isEditingLocal && (
          <div className="rounded-md border border-border-control bg-background p-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Pengaturan Harga Lokal (Khusus Perangkat Ini)
                </h3>
                <p className="text-xs text-muted">
                  Jika harga emas sedang naik/turun, Anda dapat mengubahnya di bawah ini tanpa mengubah harga universal pengguna lain.
                </p>
              </div>

              {isLocalOverride && (
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={onResetToUniversal}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Ikuti Harga Universal Lagi</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="local-buy-price">
                  Harga Beli Lokal ({unitLabel})
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-semibold text-muted">
                    Rp
                  </span>
                  <Input
                    id="local-buy-price"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    className="pl-10"
                    placeholder={isPer001 ? "Contoh: 20.000" : "Contoh: 2.000.000"}
                    value={formatThousandSeparator(displayBuy)}
                    onChange={(e) =>
                      handleLocalBuyChange(parseDigitsToNumber(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="local-buyback-price">
                  Harga Jual / Buyback Lokal ({unitLabel})
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-semibold text-muted">
                    Rp
                  </span>
                  <Input
                    id="local-buyback-price"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    className="pl-10"
                    placeholder={isPer001 ? "Contoh: 19.300" : "Contoh: 1.930.000"}
                    value={formatThousandSeparator(displayBuyback)}
                    onChange={(e) =>
                      handleLocalBuybackChange(
                        parseDigitsToNumber(e.target.value)
                      )
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
