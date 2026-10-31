"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Scale, Sun, Moon, AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { PriceCard } from "@/app/components/PriceCard";
import { CalculatorForm } from "@/app/components/CalculatorForm";
import { ResultSummary } from "@/app/components/ResultSummary";
import {
  InputMode,
  PaymentTransactionRow,
  calculatePaymentVaBonus,
  calculateTringCuan,
} from "@/app/lib/calculator";
import {
  PriceUnitMode,
  StoredPriceSettings,
  loadLocalPriceOverride,
  saveLocalPriceOverride,
  clearLocalPriceOverride,
} from "@/app/lib/price-storage";

export interface CalculatorAppProps {
  initialUniversalSettings: StoredPriceSettings;
}

export function CalculatorApp({
  initialUniversalSettings,
}: CalculatorAppProps) {
  const [isDark, setIsDark] = useState(false);

  const [universalSettings, setUniversalSettings] =
    useState<StoredPriceSettings>(initialUniversalSettings);
  const [localOverride, setLocalOverride] =
    useState<StoredPriceSettings | null>(null);
  const [unitMode, setUnitMode] = useState<PriceUnitMode>(
    initialUniversalSettings.unitMode || "0.01g"
  );

  const [inputMode, setInputMode] = useState<InputMode>("rupiah");
  const [nominalInput, setNominalInput] = useState<number>(0);
  const [gramInput, setGramInput] = useState<string>("0");
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [voucherCoversServiceFee, setVoucherCoversServiceFee] =
    useState<boolean>(true);
  const [digitalBankCount, setDigitalBankCount] = useState<number>(1);
  const [bcaCount, setBcaCount] = useState<number>(0);

  const fetchUniversalSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/price", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as StoredPriceSettings;
      if (
        typeof data.buyPricePerGram === "number" &&
        data.buyPricePerGram > 0 &&
        typeof data.buybackPricePerGram === "number" &&
        data.buybackPricePerGram > 0
      ) {
        setUniversalSettings(data);
        const existingLocal = loadLocalPriceOverride();
        if (!existingLocal && data.unitMode) {
          setUnitMode(data.unitMode);
        }
      }
    } catch {
      // Keep existing universal settings if offline
    }
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("tring-theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    const storedLocal = loadLocalPriceOverride();
    if (storedLocal) {
      setLocalOverride(storedLocal);
      setUnitMode(storedLocal.unitMode);
    } else {
      setLocalOverride(null);
      setUnitMode(initialUniversalSettings.unitMode);
    }

    fetchUniversalSettings();

    // Auto re-fetch on window focus to catch any changes from /settings
    const onFocus = () => {
      fetchUniversalSettings();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchUniversalSettings, initialUniversalSettings]);

  const activeSettings = localOverride ?? universalSettings;
  const buyPrice = activeSettings.buyPricePerGram;
  const buybackPrice = activeSettings.buybackPricePerGram;
  const priceUpdatedAt = activeSettings.updatedAt;

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

  const handleChangeUnitMode = (nextMode: PriceUnitMode) => {
    setUnitMode(nextMode);
    if (localOverride) {
      const updated: StoredPriceSettings = {
        ...localOverride,
        unitMode: nextMode,
      };
      setLocalOverride(updated);
      saveLocalPriceOverride(updated);
    }
  };

  const handleSaveLocalPrice = (
    newBuyPerGram: number,
    newBuybackPerGram: number
  ) => {
    const updated: StoredPriceSettings = {
      buyPricePerGram: newBuyPerGram,
      buybackPricePerGram: newBuybackPerGram,
      unitMode,
      updatedAt: new Date().toISOString(),
    };
    setLocalOverride(updated);
    saveLocalPriceOverride(updated);
  };

  const handleResetToUniversal = () => {
    clearLocalPriceOverride();
    setLocalOverride(null);
    setUnitMode(universalSettings.unitMode);
    fetchUniversalSettings();
  };

  const handleResetForm = () => {
    setInputMode("rupiah");
    setNominalInput(0);
    setGramInput("0");
    setVoucherDiscount(0);
    setVoucherCoversServiceFee(true);
    setDigitalBankCount(1);
    setBcaCount(0);
  };

  const paymentRows: PaymentTransactionRow[] = useMemo(
    () => [
      { id: "fixed-digital", method: "VA_DIGITAL", frequency: digitalBankCount },
      { id: "fixed-bca", method: "VA_BCA", frequency: bcaCount },
    ],
    [digitalBankCount, bcaCount]
  );

  const paymentSummary = useMemo(
    () => calculatePaymentVaBonus(paymentRows, voucherCoversServiceFee),
    [paymentRows, voucherCoversServiceFee]
  );

  const calculationResult = useMemo(() => {
    const parsedGram = Number.parseFloat(gramInput.replace(",", ".")) || 0;
    return calculateTringCuan({
      inputMode,
      nominalInput,
      gramInput: parsedGram,
      voucherDiscount,
      voucherCoversServiceFee,
      buyPricePerGram: buyPrice,
      buybackPricePerGram: buybackPrice,
      paymentRows,
    });
  }, [
    inputMode,
    nominalInput,
    gramInput,
    voucherDiscount,
    voucherCoversServiceFee,
    buyPrice,
    buybackPrice,
    paymentRows,
  ]);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
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
                Tring! Cuan Analyzer
              </h1>
              <p className="text-xs text-muted">
                Kalkulator Audit Emas, Voucher & VA Bank Digital vs Bank Konvensional
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
                isDark
                  ? "Beralih ke tema terang (Bullion Ledger Light)"
                  : "Beralih ke tema gelap (Emerald Vault Dark)"
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
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PriceCard
          buyPrice={buyPrice}
          buybackPrice={buybackPrice}
          unitMode={unitMode}
          updatedAt={priceUpdatedAt}
          isLocalOverride={Boolean(localOverride)}
          onChangeUnitMode={handleChangeUnitMode}
          onSaveLocalPrice={handleSaveLocalPrice}
          onResetToUniversal={handleResetToUniversal}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:items-start">
          <div className="min-w-0 lg:col-span-7">
            <CalculatorForm
              inputMode={inputMode}
              nominalInput={nominalInput}
              gramInput={gramInput}
              voucherDiscount={voucherDiscount}
              voucherCoversServiceFee={voucherCoversServiceFee}
              buyPrice={buyPrice}
              bcaCount={bcaCount}
              digitalBankCount={digitalBankCount}
              paymentSummary={paymentSummary}
              onChangeInputMode={setInputMode}
              onChangeNominal={setNominalInput}
              onChangeGram={setGramInput}
              onChangeVoucher={setVoucherDiscount}
              onChangeVoucherCoversServiceFee={setVoucherCoversServiceFee}
              onChangeBcaCount={setBcaCount}
              onChangeDigitalBankCount={setDigitalBankCount}
              onResetForm={handleResetForm}
            />
          </div>

          <div className="min-w-0 lg:col-span-5 lg:sticky lg:top-6">
            <ResultSummary
              result={calculationResult}
              buyPrice={buyPrice}
              buybackPrice={buybackPrice}
            />
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div
          role="note"
          aria-label="Disclaimer akurasi kalkulator"
          className="rounded-lg border border-warn-border bg-warn-bg p-4 text-xs text-warn-text shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warn-text mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-wider text-[11px]">
                Disclaimer & Batasan Simulasi
              </p>
              <p className="leading-relaxed">
                Kalkulator ini merupakan alat simulasi independen untuk membantu perkiraan potensi cuan emas, voucher, dan biaya layanan. Hasil perhitungan <strong>bisa saja tidak sepenuhnya akurat atau memiliki sedikit selisih</strong> dibandingkan nominal riil di aplikasi Tring! by Pegadaian akibat pembulatan sistem, pembaruan kurs emas realtime saat eksekusi, serta perubahan ketentuan promo voucher atau biaya transfer perbankan. Selalu periksa kembali rincian transaksi final di aplikasi resmi Tring! Pegadaian sebelum bertransaksi.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-10 border-t border-border bg-surface py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 text-xs text-muted sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            Alat bantu simulasi untuk menghitung selisih beli, voucher promo, biaya layanan VA Rp2.500, dan buyback emas Tring! by Pegadaian.
          </p>
          <p className="font-mono tabular-nums">
            Biaya Layanan VA Awal: Rp2.500/tx · Bank Digital: Hemat Rp2.500/tx
          </p>
        </div>
      </footer>
    </div>
  );
}
