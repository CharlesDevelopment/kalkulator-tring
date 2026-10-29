"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Scale, Sun, Moon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { PriceCard } from "@/app/components/PriceCard";
import { CalculatorForm } from "@/app/components/CalculatorForm";
import { ResultSummary } from "@/app/components/ResultSummary";
import {
  InputMode,
  PaymentMethodType,
  PaymentTransactionRow,
  calculatePaymentVaBonus,
  calculateTringCuan,
} from "@/app/lib/calculator";

const DEFAULT_BUY_PRICE = 1545000;
const DEFAULT_BUYBACK_PRICE = 1495000;

const INITIAL_PAYMENT_ROWS: PaymentTransactionRow[] = [
  {
    id: "row-bca-1",
    method: "VA_BCA",
    label: "VA BCA",
    frequency: 2,
  },
  {
    id: "row-digital-1",
    method: "VA_DIGITAL",
    label: "Seabank / Bank Digital",
    frequency: 3,
  },
];

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);

  const [buyPrice, setBuyPrice] = useState<number>(DEFAULT_BUY_PRICE);
  const [buybackPrice, setBuybackPrice] = useState<number>(DEFAULT_BUYBACK_PRICE);
  const [isLivePrice, setIsLivePrice] = useState<boolean>(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSource, setPriceSource] = useState<string>(
    "Memuat dari API Pegadaian..."
  );
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string>("");
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  const [inputMode, setInputMode] = useState<InputMode>("rupiah");
  const [nominalInput, setNominalInput] = useState<number>(2500000);
  const [gramInput, setGramInput] = useState<string>("1.5");
  const [voucherDiscount, setVoucherDiscount] = useState<number>(125000);
  const [paymentRows, setPaymentRows] =
    useState<PaymentTransactionRow[]>(INITIAL_PAYMENT_ROWS);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("tring-theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
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

  const fetchRealtimePrice = useCallback(async () => {
    setIsLoadingPrice(true);
    setPriceError(null);

    try {
      const res = await fetch("/api/price", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();

      if (!isManualOverride) {
        if (typeof data.buyPrice === "number" && data.buyPrice > 0) {
          setBuyPrice(data.buyPrice);
        }
        if (typeof data.buybackPrice === "number" && data.buybackPrice > 0) {
          setBuybackPrice(data.buybackPrice);
        }
      }

      setIsLivePrice(Boolean(data.isLive));
      setPriceSource(data.source || "Pegadaian");
      setPriceUpdatedAt(data.updatedAt || new Date().toISOString());

      if (data.message) {
        setPriceError(data.message);
      }
    } catch {
      setIsLivePrice(false);
      setPriceSource("Mode Cadangan Lokal");
      setPriceUpdatedAt(new Date().toISOString());
      setPriceError(
        "Gagal menghubungi server harga realtime. Anda dapat menekan tombol 'Ubah Harga Manual' untuk memasukkan kurs aplikasi Tring! saat ini."
      );
    } finally {
      setIsLoadingPrice(false);
    }
  }, [isManualOverride]);

  useEffect(() => {
    fetchRealtimePrice();
  }, [fetchRealtimePrice]);

  const handleAddPaymentRow = (
    method: PaymentMethodType = "VA_DIGITAL",
    label = "Seabank / Bank Digital",
    frequency = 1
  ) => {
    const newId = `va-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPaymentRows((prev) => [
      ...prev,
      { id: newId, method, label, frequency },
    ]);
  };

  const handleUpdatePaymentRow = (
    id: string,
    updates: Partial<Omit<PaymentTransactionRow, "id">>
  ) => {
    setPaymentRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
    );
  };

  const handleRemovePaymentRow = (id: string) => {
    setPaymentRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleApplyPresetSplit = (bcaFreq: number, digitalFreq: number) => {
    setPaymentRows([
      {
        id: "preset-bca",
        method: "VA_BCA",
        label: "VA BCA",
        frequency: bcaFreq,
      },
      {
        id: "preset-digital",
        method: "VA_DIGITAL",
        label: "Seabank / Bank Digital",
        frequency: digitalFreq,
      },
    ]);
  };

  const handleResetForm = () => {
    setInputMode("rupiah");
    setNominalInput(0);
    setGramInput("0");
    setVoucherDiscount(0);
    setPaymentRows([
      {
        id: "reset-digital",
        method: "VA_DIGITAL",
        label: "Seabank / Bank Digital",
        frequency: 1,
      },
    ]);
  };

  const paymentSummary = useMemo(
    () => calculatePaymentVaBonus(paymentRows),
    [paymentRows]
  );

  const calculationResult = useMemo(() => {
    const parsedGram = Number.parseFloat(gramInput.replace(",", ".")) || 0;
    return calculateTringCuan({
      inputMode,
      nominalInput,
      gramInput: parsedGram,
      voucherDiscount,
      buyPricePerGram: buyPrice,
      buybackPricePerGram: buybackPrice,
      paymentRows,
    });
  }, [
    inputMode,
    nominalInput,
    gramInput,
    voucherDiscount,
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
                Kalkulator Audit Emas, Voucher & Multi-VA Bank Digital Pegadaian
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
          isLive={isLivePrice}
          isLoading={isLoadingPrice}
          errorMessage={priceError}
          sourceName={priceSource}
          updatedAt={priceUpdatedAt}
          isManualOverride={isManualOverride}
          onRefresh={fetchRealtimePrice}
          onToggleManualOverride={setIsManualOverride}
          onChangeBuyPrice={(val) => {
            setIsManualOverride(true);
            setBuyPrice(val);
          }}
          onChangeBuybackPrice={(val) => {
            setIsManualOverride(true);
            setBuybackPrice(val);
          }}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <CalculatorForm
              inputMode={inputMode}
              nominalInput={nominalInput}
              gramInput={gramInput}
              voucherDiscount={voucherDiscount}
              buyPrice={buyPrice}
              paymentRows={paymentRows}
              paymentSummary={paymentSummary}
              onChangeInputMode={setInputMode}
              onChangeNominal={setNominalInput}
              onChangeGram={setGramInput}
              onChangeVoucher={setVoucherDiscount}
              onAddPaymentRow={handleAddPaymentRow}
              onUpdatePaymentRow={handleUpdatePaymentRow}
              onRemovePaymentRow={handleRemovePaymentRow}
              onApplyPresetSplit={handleApplyPresetSplit}
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
            Alat bantu simulasi independen untuk menghitung selisih beli, voucher promo, cuan free admin VA Bank Digital, dan buyback emas Tring! by Pegadaian.
          </p>
          <p className="font-mono tabular-nums">
            VA BCA: Tetap (Rp0) · VA Bayar Via Bank Digital: +Rp2.500 Cuan/transaksi
          </p>
        </div>
      </footer>
    </div>
  );
}
