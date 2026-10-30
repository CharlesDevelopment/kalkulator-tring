"use client";

import React from "react";
import { Calculator, RotateCcw, Coins } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { InputMode, PaymentBonusSummary, roundGoldGram } from "@/app/lib/calculator";
import {
  formatRupiah,
  formatGram,
  formatThousandSeparator,
  parseDigitsToNumber,
} from "@/app/lib/format";
import { PaymentBreakdown } from "./PaymentBreakdown";

export interface CalculatorFormProps {
  inputMode: InputMode;
  nominalInput: number;
  gramInput: string;
  voucherDiscount: number;
  voucherCoversServiceFee: boolean;
  buyPrice: number;
  bcaCount: number;
  digitalBankCount: number;
  paymentSummary: PaymentBonusSummary;
  onChangeInputMode: (mode: InputMode) => void;
  onChangeNominal: (value: number) => void;
  onChangeGram: (value: string) => void;
  onChangeVoucher: (value: number) => void;
  onChangeVoucherCoversServiceFee: (covers: boolean) => void;
  onChangeBcaCount: (count: number) => void;
  onChangeDigitalBankCount: (count: number) => void;
  onResetForm: () => void;
}

const NOMINAL_PRESETS = [10000, 25000, 100000, 500000, 1000000];
const GRAM_PRESETS = ["0.01", "0.05", "0.1", "0.5", "1"];
const VOUCHER_PRESETS = [5000, 10000, 15000, 25000, 50000];

export function CalculatorForm({
  inputMode,
  nominalInput,
  gramInput,
  voucherDiscount,
  voucherCoversServiceFee,
  buyPrice,
  bcaCount,
  digitalBankCount,
  paymentSummary,
  onChangeInputMode,
  onChangeNominal,
  onChangeGram,
  onChangeVoucher,
  onChangeVoucherCoversServiceFee,
  onChangeBcaCount,
  onChangeDigitalBankCount,
  onResetForm,
}: CalculatorFormProps) {
  const parsedGram = Number.parseFloat(gramInput.replace(",", ".")) || 0;
  const effectiveModal =
    inputMode === "rupiah"
      ? nominalInput
      : Math.round(Math.max(0, parsedGram) * buyPrice);
  const effectiveGram =
    inputMode === "gram"
      ? roundGoldGram(Math.max(0, parsedGram))
      : buyPrice > 0
      ? roundGoldGram(nominalInput / buyPrice)
      : 0;

  return (
    <Card aria-label="Formulir Parameter Transaksi Emas Tring!">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted" aria-hidden="true" />
            <span>Parameter Pembelian & Voucher</span>
          </CardTitle>
          <p className="mt-1 text-xs text-muted">
            Masukkan total pembelian emas (Rupiah atau Berat Gram), potongan voucher/cashback, dan metode pembayaran VA.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetForm}
          aria-label="Kosongkan formulir ke nilai awal"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Reset Nilai</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label htmlFor="purchase-primary-input">
              1. Nominal Pembelian Emas (per 1x Transaksi)
            </Label>
            <div
              role="group"
              aria-label="Pilih mode input pembelian emas"
              className="grid grid-cols-2 gap-1.5 rounded-md border border-border-control bg-surface-subtle p-1"
            >
              <button
                type="button"
                onClick={() => onChangeInputMode("rupiah")}
                aria-pressed={inputMode === "rupiah"}
                className={`min-h-[40px] rounded px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  inputMode === "rupiah"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                Nominal Modal (Rp)
              </button>
              <button
                type="button"
                onClick={() => onChangeInputMode("gram")}
                aria-pressed={inputMode === "gram"}
                className={`min-h-[40px] rounded px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  inputMode === "gram"
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                Berat Emas (Gram)
              </button>
            </div>
          </div>

          {inputMode === "rupiah" ? (
            <div className="space-y-2">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-bold text-muted">
                  Rp
                </span>
                <Input
                  id="purchase-primary-input"
                  type="text"
                  inputMode="numeric"
                  className="pl-10 text-lg font-bold"
                  placeholder="0"
                  value={formatThousandSeparator(nominalInput)}
                  onChange={(e) =>
                    onChangeNominal(parseDigitsToNumber(e.target.value))
                  }
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {NOMINAL_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="subtle"
                      size="sm"
                      onClick={() => onChangeNominal(preset)}
                    >
                      {formatRupiah(preset)}
                    </Button>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gold-border bg-gold-bg px-2.5 py-1 font-mono text-xs font-bold tabular-nums text-gold-text">
                  <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                  Setara {formatGram(effectiveGram)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="purchase-primary-input"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  className="pr-16 text-lg font-bold"
                  placeholder="0"
                  value={gramInput === "0" ? "" : gramInput}
                  onChange={(e) => onChangeGram(e.target.value)}
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 font-mono text-sm font-bold text-muted">
                  gram
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {GRAM_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="subtle"
                      size="sm"
                      onClick={() => onChangeGram(preset)}
                    >
                      {preset.replace(".", ",")} gram
                    </Button>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gold-border bg-gold-bg px-2.5 py-1 font-mono text-xs font-bold tabular-nums text-gold-text">
                  <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                  Modal Beli {formatRupiah(effectiveModal)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-border pt-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="voucher-discount-input">
                2. Potongan Voucher / Cashback (per 1x Transaksi)
              </Label>
              {effectiveModal > 0 && voucherDiscount > 0 && (
                <span className="font-mono text-xs font-semibold tabular-nums text-profit-text">
                  Diskon Efektif:{" "}
                  {((voucherDiscount / effectiveModal) * 100)
                    .toFixed(2)
                    .replace(".", ",")}
                  %
                </span>
              )}
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm font-bold text-muted">
                Rp
              </span>
              <Input
                id="voucher-discount-input"
                type="text"
                inputMode="numeric"
                className="pl-10 text-lg font-bold"
                placeholder="0"
                value={formatThousandSeparator(voucherDiscount)}
                onChange={(e) =>
                  onChangeVoucher(parseDigitsToNumber(e.target.value))
                }
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {VOUCHER_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => onChangeVoucher(preset)}
                >
                  +{formatRupiah(preset)}
                </Button>
              ))}
              {voucherDiscount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeVoucher(0)}
                >
                  Tanpa Voucher (Rp0)
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface-subtle p-3.5 space-y-2.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="block text-sm font-bold text-foreground">
                  Apakah voucher memotong biaya layanan VA (Rp2.500)?
                </span>
                <span className="block text-xs text-muted">
                  {voucherCoversServiceFee
                    ? "Ya: Voucher sudah menggratiskan biaya layanan Rp2.500, sehingga bayar via Bank Digital memberi +Rp2.500 Cuan Tambahan."
                    : "Tidak: Biaya layanan Rp2.500 tetap ditagihkan, sehingga bayar via Bank Digital hanya menutup biaya layanan tersebut (tanpa tambahan cuan)."}
                </span>
              </div>

              <div
                role="group"
                aria-label="Apakah voucher memotong biaya layanan"
                className="grid grid-cols-2 gap-1.5 rounded-md border border-border-control bg-background p-1 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => onChangeVoucherCoversServiceFee(true)}
                  aria-pressed={voucherCoversServiceFee}
                  className={`min-h-[40px] rounded px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    voucherCoversServiceFee
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  Ya (+Rp2.500 Cuan)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeVoucherCoversServiceFee(false)}
                  aria-pressed={!voucherCoversServiceFee}
                  className={`min-h-[40px] rounded px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    !voucherCoversServiceFee
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  Tidak (Normal)
                </button>
              </div>
            </div>
          </div>
        </div>

        <PaymentBreakdown
          bcaCount={bcaCount}
          digitalBankCount={digitalBankCount}
          voucherCoversServiceFee={voucherCoversServiceFee}
          summary={paymentSummary}
          onChangeBcaCount={onChangeBcaCount}
          onChangeDigitalBankCount={onChangeDigitalBankCount}
        />
      </CardContent>
    </Card>
  );
}
