"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Scale,
  ArrowLeft,
  Save,
  CheckCircle2,
  Sun,
  Moon,
  Lock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  PriceUnitMode,
  DEFAULT_PRICE_SETTINGS,
  StoredPriceSettings,
  clearLocalPriceOverride,
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

  const [password, setPassword] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("tring-theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    fetch("/api/price", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: StoredPriceSettings) => {
        if (
          typeof data.buyPricePerGram === "number" &&
          data.buyPricePerGram > 0
        ) {
          setBuyPricePerGram(data.buyPricePerGram);
          setBuybackPricePerGram(data.buybackPricePerGram);
          setUnitMode(data.unitMode || "0.01g");
          setUpdatedAt(data.updatedAt || new Date().toISOString());
        }
      })
      .catch(() => {});
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
    setErrorMessage(null);
  };

  const handleBuybackInputChange = (rawDigits: number) => {
    const nextPerGram = isPer001 ? rawDigits * 100 : rawDigits;
    setBuybackPricePerGram(nextPerGram);
    setSavedNotice(false);
    setErrorMessage(null);
  };

  const handleSaveUniversal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedNotice(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          buyPricePerGram,
          buybackPricePerGram,
          unitMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error || "Gagal menyimpan pengaturan harga universal."
        );
      } else {
        if (data.settings?.updatedAt) {
          setUpdatedAt(data.settings.updatedAt);
        }
        // Bersihkan override lokal di perangkat admin agar langsung melihat harga universal baru
        clearLocalPriceOverride();
        setSavedNotice(true);
      }
    } catch {
      setErrorMessage(
        "Gagal menghubungi server untuk menyimpan harga universal."
      );
    } finally {
      setIsSaving(false);
    }
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
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border"
              aria-hidden="true"
            >
              <Image
                src="/logo.jpg"
                alt="Logo Tring! Pegadaian"
                width={40}
                height={40}
                priority
                className="h-full w-full object-contain p-0.5"
              />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Pengaturan Harga Universal (Admin)
              </h1>
              <p className="text-xs text-muted">
                Perubahan di halaman ini akan memperbarui harga emas di seluruh perangkat pengunjung
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

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Kembali ke Kalkulator</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Atur Kurs Harga Universal (Semua Device)</CardTitle>
              <p className="mt-1 text-xs text-muted">
                Terakhir diperbarui:{" "}
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
            <form onSubmit={handleSaveUniversal} className="space-y-6">
              {savedNotice && (
                <div
                  role="status"
                  className="flex items-center justify-between gap-3 rounded-md border border-profit-border bg-profit-bg p-3.5 text-xs font-semibold text-profit-text"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      Harga Universal berhasil diperbarui untuk semua perangkat!
                    </span>
                  </div>
                  <a
                    href="/"
                    className="underline font-bold whitespace-nowrap"
                  >
                    Buka Kalkulator
                  </a>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-md border border-loss-border bg-loss-bg p-3.5 text-xs font-semibold text-loss-text"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
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
                      placeholder={
                        isPer001 ? "Contoh: 20.000" : "Contoh: 2.000.000"
                      }
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
                      placeholder={
                        isPer001 ? "Contoh: 19.300" : "Contoh: 1.930.000"
                      }
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

              <div className="rounded-md border border-border bg-surface-subtle p-4 space-y-2">
                <Label
                  htmlFor="admin-password-input"
                  className="flex items-center gap-1.5 text-sm font-bold text-foreground"
                >
                  <Lock className="h-4 w-4 text-muted" aria-hidden="true" />
                  <span>Password Admin untuk Menyimpan Harga Universal</span>
                </Label>
                <Input
                  id="admin-password-input"
                  type="password"
                  className="font-sans"
                  placeholder="Masukkan password admin..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                />
                <p className="text-xs text-muted">
                  Diperlukan password agar pengunjung biasa tidak dapat mengubah harga universal seenaknya.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                <Button type="submit" variant="default" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Menyimpan ke Semua Device...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" aria-hidden="true" />
                      <span>Simpan Harga Universal</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
