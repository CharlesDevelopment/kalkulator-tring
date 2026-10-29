"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Save, RotateCcw, CheckCircle2, Sun, Moon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  PriceUnitMode,
  DEFAULT_PRICE_SETTINGS,
  loadPriceSettings,
  savePriceSettings,
} from "@/app/lib/price-storage";
import {
  formatRupiah,
  formatThousandSeparator,
  parseDigitsToNumber,
  formatTimestampWIB,
} from "@/app/lib/format";

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(false);
  const [unitMode, setUnitMode] = useState<PriceUnitMode>(
    DEFAULT_PRICE_SETTINGS.unitMode
  );
  const [buyPricePerGram, setBuyPricePerGram] = useState<number>(
    DEFAULT_PRICE_SETTINGS.buyPricePerGram
  );
  const [buybackPricePerGram, setBuybackPricePerGram] = useState<number>(
    DEFAULT_PRICE_SETTINGS.buybackPricePerGram
  );
  const [updatedAt, setUpdatedAt] = useState<string>(
    DEFAULT_PRICE_SETTINGS.updatedAt
  );
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("tring-theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    const stored = loadPriceSettings();
    setBuyPricePerGram(stored.buyPricePerGram);
    setBuybackPricePerGram(stored.buybackPricePerGram);
    setUnitMode(stored.unitMode);
    setUpdatedAt(stored.updatedAt);
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("tring-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("tring-theme", "light");
    }
  };

  const isPer001 = unitMode === "0.01g";
  const displayedBuyValue = isPer001
    ? Math.round(buyPricePerGram / 100)
    : buyPricePerGram;
  const displayedBuybackValue = isPer001
    ? Math.round(buybackPricePerGram / 100)
    : buybackPricePerGram;

  const handleBuyInputChange = (rawDigits: number) => {
    const nextPerGram = isPer001 ? rawDigits * 100 : rawDigits;
    setBuyPricePerGram(nextPerGram);
    setSavedNotice(false);
  };

  const handleBuybackInputChange = (rawDigits: number) => {
    const nextPerGram = isPer001 ? rawDigits * 100 : rawDigits;
    setBuybackPricePerGram(nextPerGram);
    setSavedNotice(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nowIso = new Date().toISOString();
    savePriceSettings({
      buyPricePerGram,
      buybackPricePerGram,
      unitMode,
      updatedAt: nowIso,
    });
    setUpdatedAt(nowIso);
    setSavedNotice(true);
  };

  const handleResetDefault = () => {
    const nowIso = new Date().toISOString();
    setBuyPricePerGram(DEFAULT_PRICE_SETTINGS.buyPricePerGram);
    setBuybackPricePerGram(DEFAULT_PRICE_SETTINGS.buybackPricePerGram);
    setUnitMode(DEFAULT_PRICE_SETTINGS.unitMode);
    setUpdatedAt(nowIso);
    savePriceSettings({
      buyPricePerGram: DEFAULT_PRICE_SETTINGS.buyPricePerGram,
      buybackPricePerGram: DEFAULT_PRICE_SETTINGS.buybackPricePerGram,
      unitMode: DEFAULT_PRICE_SETTINGS.unitMode,
      updatedAt: nowIso,
    });
    setSavedNotice(true);
  };

  const spreadPerGram = Math.max(0, buyPricePerGram - buybackPricePerGram);
  const spreadPer001 = Math.round(spreadPerGram / 100);
  const spreadPct =
    buyPricePerGram > 0 ? (spreadPerGram / buyPricePerGram) * 100 : 0;

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground"
              aria-hidden="true"
            >
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Pengaturan Harga Emas Tring!
              </h1>
              <p className="text-xs text-muted">
                Sesuaikan Harga Beli & Harga Jual (Buyback) per 0,01 gram atau per 1 gram
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleTheme}
              aria-label={
                isDark ? "Beralih ke tema terang" : "Beralih ke tema gelap"
              }
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Mode Gelap</span>
                </>
              )}
            </Button>

            <Button asChild variant="default" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Kembali ke Kalkulator</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Atur Kurs Harga Beli & Buyback Sendiri</CardTitle>
              <p className="mt-1 text-xs text-muted">
                Terakhir disimpan:{" "}
                <span className="font-mono tabular-nums text-foreground">
                  {formatTimestampWIB(updatedAt)}
                </span>
              </p>
            </div>

            <div
              role="group"
              aria-label="Pilih mode satuan input harga emas"
              className="grid grid-cols-2 gap-1.5 rounded-md border border-border-control bg-surface-subtle p-1"
            >
              <button
                type="button"
                onClick={() => setUnitMode("0.01g")}
                aria-pressed={isPer001}
                className={`min-h-[40px] rounded px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isPer001
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                Mode per 0,01 Gram
              </button>
              <button
                type="button"
                onClick={() => setUnitMode("1g")}
                aria-pressed={!isPer001}
                className={`min-h-[40px] rounded px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  !isPer001
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                Mode per 1 Gram
              </button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {savedNotice && (
                <div
                  role="status"
                  className="flex items-center justify-between gap-3 rounded-md border border-profit-border bg-profit-bg p-3.5 text-xs font-semibold text-profit-text"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      Harga emas berhasil disimpan! Kalkulator utama otomatis menggunakan harga ini.
                    </span>
                  </div>
                  <Link
                    href="/"
                    className="underline font-bold whitespace-nowrap"
                  >
                    Buka Kalkulator
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="settings-buy-price">
                    Harga Beli Emas ({isPer001 ? "per 0,01 Gram" : "per 1 Gram"})
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-bold text-muted">
                      Rp
                    </span>
                    <Input
                      id="settings-buy-price"
                      type="text"
                      inputMode="numeric"
                      className="pl-10 text-lg font-bold"
                      placeholder={isPer001 ? "Contoh: 15.450" : "Contoh: 1.545.000"}
                      value={formatThousandSeparator(displayedBuyValue)}
                      onChange={(e) =>
                        handleBuyInputChange(parseDigitsToNumber(e.target.value))
                      }
                    />
                  </div>
                  <p className="text-xs text-muted">
                    {isPer001
                      ? `Setara ${formatRupiah(buyPricePerGram)} per 1 gram`
                      : `Setara ${formatRupiah(Math.round(buyPricePerGram / 100))} per 0,01 gram`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-buyback-price">
                    Harga Jual / Buyback ({isPer001 ? "per 0,01 Gram" : "per 1 Gram"})
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-bold text-muted">
                      Rp
                    </span>
                    <Input
                      id="settings-buyback-price"
                      type="text"
                      inputMode="numeric"
                      className="pl-10 text-lg font-bold"
                      placeholder={isPer001 ? "Contoh: 14.950" : "Contoh: 1.495.000"}
                      value={formatThousandSeparator(displayedBuybackValue)}
                      onChange={(e) =>
                        handleBuybackInputChange(
                          parseDigitsToNumber(e.target.value)
                        )
                      }
                    />
                  </div>
                  <p className="text-xs text-muted">
                    {isPer001
                      ? `Setara ${formatRupiah(buybackPricePerGram)} per 1 gram`
                      : `Setara ${formatRupiah(Math.round(buybackPricePerGram / 100))} per 0,01 gram`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-surface-subtle p-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-muted">Ringkasan per 0,01 Gram</span>
                  <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
                    Beli: {formatRupiah(Math.round(buyPricePerGram / 100))} · Jual:{" "}
                    {formatRupiah(Math.round(buybackPricePerGram / 100))}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted">Ringkasan per 1 Gram</span>
                  <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
                    Beli: {formatRupiah(buyPricePerGram)} · Jual:{" "}
                    {formatRupiah(buybackPricePerGram)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted">Selisih Spread</span>
                  <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
                    {formatRupiah(spreadPer001)} / 0,01g ({spreadPct.toFixed(2).replace(".", ",")}%)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetDefault}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Reset ke Harga Standar</span>
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" variant="default">
                    <Save className="h-4 w-4" aria-hidden="true" />
                    <span>Simpan Pengaturan Harga</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
