"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Scale, Sun, Moon, Settings } from "lucide-react";
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
  DEFAULT_PRICE_SETTINGS,
  loadPriceSettings,
  savePriceSettings,
} from "@/app/lib/price-storage";

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);

  const [buyPrice, setBuyPrice] = useState<number>(
    DEFAULT_PRICE_SETTINGS.buyPricePerGram
  );
  const [buybackPrice, setBuybackPrice] = useState<number>(
    DEFAULT_PRICE_SETTINGS.buybackPricePerGram
  );
  const [unitMode, setUnitMode] = useState<PriceUnitMode>(
    DEFAULT_PRICE_SETTINGS.unitMode
  );
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string>(
    DEFAULT_PRICE_SETTINGS.updatedAt
  );

  const [inputMode, setInputMode] = useState<InputMode>("rupiah");
  const [nominalInput, setNominalInput] = useState<number>(25000);
  const [gramInput, setGramInput] = useState<string>("0.05");
  const [voucherDiscount, setVoucherDiscount] = useState<number>(10000);
  const [voucherCoversServiceFee, setVoucherCoversServiceFee] =
    useState<boolean>(true);
  const [digitalBankCount, setDigitalBankCount] = useState<number>(1);
  const [bcaCount, setBcaCount] = useState<number>(0);

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
    setBuyPrice(stored.buyPricePerGram);
    setBuybackPrice(stored.buybackPricePerGram);
    setUnitMode(stored.unitMode);
    setPriceUpdatedAt(stored.updatedAt);
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

  const handleChangeUnitMode = (nextMode: PriceUnitMode) => {
    setUnitMode(nextMode);
    savePriceSettings({
      buyPricePerGram: buyPrice,
      buybackPricePerGram: buybackPrice,
      unitMode: nextMode,
      updatedAt: priceUpdatedAt,
    });
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground"
              aria-hidden="true"
            >
              <Scale className="h-5 w-5" />
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
            <Button asChild variant="subtle" size="sm">
              <Link href="/settings">
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Pengaturan Harga</span>
              </Link>
            </Button>

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
          onChangeUnitMode={handleChangeUnitMode}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
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

          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <ResultSummary
              result={calculationResult}
              buyPrice={buyPrice}
              buybackPrice={buybackPrice}
            />
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
