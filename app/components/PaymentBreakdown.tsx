"use client";

import React from "react";
import { Landmark } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { PaymentBonusSummary, VA_BONUS_RATES } from "@/app/lib/calculator";
import { formatRupiah } from "@/app/lib/format";

export interface PaymentBreakdownProps {
  bcaCount: number;
  digitalBankCount: number;
  summary: PaymentBonusSummary;
  onChangeBcaCount: (count: number) => void;
  onChangeDigitalBankCount: (count: number) => void;
}

export function PaymentBreakdown({
  bcaCount,
  digitalBankCount,
  summary,
  onChangeBcaCount,
  onChangeDigitalBankCount,
}: PaymentBreakdownProps) {
  const digitalBonusSubtotal =
    Math.max(0, digitalBankCount) * VA_BONUS_RATES.VA_DIGITAL;

  return (
    <div className="space-y-4 border-t border-border pt-5">
      <div className="space-y-1">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Landmark className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <span>Metode Pembayaran Virtual Account (VA)</span>
        </h3>
        <p className="text-xs text-muted">
          Masukkan berapa kali Anda membayar menggunakan{" "}
          <strong className="font-semibold text-foreground">
            VA Bayar Via Bank Digital
          </strong>{" "}
          (+Rp2.500 cuan/transaksi) atau{" "}
          <strong className="font-semibold text-foreground">VA BCA</strong>{" "}
          (tetap Rp0).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col justify-between rounded-md border border-border bg-surface-subtle p-3.5">
          <div className="space-y-2">
            <div>
              <Label
                htmlFor="va-digital-count"
                className="block text-sm font-bold text-foreground"
              >
                VA Bayar Via Bank Digital
              </Label>
              <span className="text-xs font-semibold text-profit-text">
                +Rp2.500 Cuan / transaksi (Free Admin)
              </span>
            </div>

            <div className="pt-1">
              <Label
                htmlFor="va-digital-count"
                className="mb-1 block text-xs text-muted"
              >
                Jumlah Transaksi (Kali)
              </Label>
              <Input
                id="va-digital-count"
                type="number"
                min={0}
                max={999}
                inputMode="numeric"
                value={digitalBankCount.toString()}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10);
                  onChangeDigitalBankCount(
                    Number.isNaN(val) ? 0 : Math.max(0, val)
                  );
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-xs">
            <span className="text-muted">Tambahan Cuan:</span>
            <span className="font-mono text-sm font-bold tabular-nums text-profit-text">
              +{formatRupiah(digitalBonusSubtotal)}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-md border border-border bg-surface-subtle p-3.5">
          <div className="space-y-2">
            <div>
              <Label
                htmlFor="va-bca-count"
                className="block text-sm font-bold text-foreground"
              >
                VA BCA
              </Label>
              <span className="text-xs text-muted">
                Biaya Tetap (Rp0 / Tidak Menambah Cuan)
              </span>
            </div>

            <div className="pt-1">
              <Label
                htmlFor="va-bca-count"
                className="mb-1 block text-xs text-muted"
              >
                Jumlah Transaksi (Kali)
              </Label>
              <Input
                id="va-bca-count"
                type="number"
                min={0}
                max={999}
                inputMode="numeric"
                value={bcaCount.toString()}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10);
                  onChangeBcaCount(Number.isNaN(val) ? 0 : Math.max(0, val));
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-xs">
            <span className="text-muted">Tambahan Cuan:</span>
            <span className="font-mono text-sm font-bold tabular-nums text-foreground">
              Rp0
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 rounded-md border border-border bg-background px-4 py-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-muted">
            Total Rincian VA ({summary.totalTransactions}x Transaksi):
          </span>
          <p className="font-mono text-xs font-semibold tabular-nums text-foreground sm:text-sm">
            {summary.formulaText} = +{formatRupiah(summary.totalVaBonus)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs text-muted">
            Total Tambahan Cuan VA Bank Digital
          </span>
          <p className="font-mono text-base font-bold tabular-nums text-profit-text">
            +{formatRupiah(summary.totalVaBonus)}
          </p>
        </div>
      </div>
    </div>
  );
}
