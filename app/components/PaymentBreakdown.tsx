"use client";

import React from "react";
import { Landmark } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  PaymentBonusSummary,
  VA_BONUS_RATES,
  VA_SERVICE_FEE_PER_TX,
} from "@/app/lib/calculator";
import { formatRupiah, formatSignedRupiah } from "@/app/lib/format";

export interface PaymentBreakdownProps {
  bcaCount: number;
  digitalBankCount: number;
  voucherCoversServiceFee: boolean;
  summary: PaymentBonusSummary;
  onChangeBcaCount: (count: number) => void;
  onChangeDigitalBankCount: (count: number) => void;
}

export function PaymentBreakdown({
  bcaCount,
  digitalBankCount,
  voucherCoversServiceFee,
  summary,
  onChangeBcaCount,
  onChangeDigitalBankCount,
}: PaymentBreakdownProps) {
  const digitalSavedSubtotal =
    Math.max(0, digitalBankCount) * VA_BONUS_RATES.VA_DIGITAL;
  const bcaExtraFeeSubtotal =
    Math.max(0, bcaCount) * VA_SERVICE_FEE_PER_TX;

  return (
    <div className="space-y-4 border-t border-border pt-5">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Landmark className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <span>3. Metode Pembayaran Virtual Account (VA)</span>
          </h3>
          <span className="rounded border border-warn-border bg-warn-bg px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums text-warn-text">
            Biaya Layanan VA Awal: +{formatRupiah(VA_SERVICE_FEE_PER_TX)}/tx (Total +{formatRupiah(summary.initialServiceFee)})
          </span>
        </div>

        <p className="text-xs text-muted">
          Dari awal setiap transaksi dikenakan biaya layanan VA{" "}
          <strong className="font-mono font-semibold text-foreground">
            Rp2.500
          </strong>
          .{" "}
          {voucherCoversServiceFee ? (
            <span>
              Karena <strong className="text-foreground">Voucher Memotong Biaya Layanan (Ya)</strong>, maka bayar via{" "}
              <strong className="text-profit-text">Bank Digital</strong> memberi{" "}
              <strong className="text-profit-text">+Rp2.500 Cuan Tambahan/tx</strong>, sedangkan via{" "}
              <strong className="text-foreground">Bank Konvensional</strong> tetap{" "}
              <strong className="text-foreground">Rp0</strong> (biaya layanan sudah terpotong voucher).
            </span>
          ) : (
            <span>
              Karena <strong className="text-foreground">Voucher TIDAK Memotong Biaya Layanan</strong>, maka bayar via{" "}
              <strong className="text-foreground">Bank Digital</strong> menghapus biaya layanan Rp2.500 tersebut (impas <strong className="text-foreground">Rp0</strong> tanpa cuan tambahan), sedangkan via{" "}
              <strong className="text-loss-text">Bank Konvensional</strong> tetap membayar biaya layanan{" "}
              <strong className="text-loss-text">-Rp2.500/tx</strong>.
            </span>
          )}
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
              <span className="block text-xs text-muted">
                Seabank, Blu, Bank Jago, Neo, dll. (Program Gratis Admin Transfer)
              </span>
              <span
                className={`mt-1 inline-block text-xs font-semibold ${
                  voucherCoversServiceFee ? "text-profit-text" : "text-foreground"
                }`}
              >
                {voucherCoversServiceFee
                  ? "+Rp2.500 Cuan Tambahan / transaksi"
                  : "Hemat Rp2.500 (Menutup Biaya Layanan Awal -> Impas Rp0)"}
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
            <span className="text-muted">
              {voucherCoversServiceFee
                ? "Tambahan Cuan Bersih:"
                : "Potongan Tagihan VA:"}
            </span>
            <span
              className={`font-mono text-sm font-bold tabular-nums ${
                voucherCoversServiceFee && digitalSavedSubtotal > 0
                  ? "text-profit-text"
                  : "text-foreground"
              }`}
            >
              {voucherCoversServiceFee
                ? digitalSavedSubtotal > 0
                  ? `+${formatRupiah(digitalSavedSubtotal)} (Cuan)`
                  : "Rp0"
                : digitalSavedSubtotal > 0
                ? `Hemat ${formatRupiah(digitalSavedSubtotal)} (Impas Admin)`
                : "Rp0"}
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
                VA Bayar melalui Bank
              </Label>
              <span className="block text-xs text-muted">
                Bank konvensional seperti VA BCA bayar di myBCA, BRI, Mandiri, BNI
              </span>
              <span
                className={`mt-1 inline-block text-xs font-semibold ${
                  voucherCoversServiceFee ? "text-muted" : "text-loss-text"
                }`}
              >
                {voucherCoversServiceFee
                  ? "Tetap Rp0 (Tidak Menambah Cuan)"
                  : "Tetap Kena Biaya Layanan (-Rp2.500 / transaksi)"}
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
            <span className="text-muted">Efek ke Cuan:</span>
            <span
              className={`font-mono text-sm font-bold tabular-nums ${
                !voucherCoversServiceFee && bcaExtraFeeSubtotal > 0
                  ? "text-loss-text"
                  : "text-foreground"
              }`}
            >
              {voucherCoversServiceFee
                ? "Rp0 (Tetap)"
                : bcaExtraFeeSubtotal > 0
                ? `-${formatRupiah(bcaExtraFeeSubtotal)} (Beban Admin)`
                : "Rp0"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 rounded-md border border-border bg-background px-4 py-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-muted">
            Ringkasan Biaya Layanan & VA ({summary.totalTransactions}x Transaksi):
          </span>
          <p className="font-mono text-xs font-semibold tabular-nums text-foreground sm:text-sm">
            Biaya Layanan Awal +{formatRupiah(summary.initialServiceFee)} · Hemat Transfer Bank Digital -{formatRupiah(summary.totalVaBonus)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs text-muted">
            {voucherCoversServiceFee
              ? "Tambahan Cuan dari VA Bank Digital"
              : "Selisih Biaya Layanan VA Bersih"}
          </span>
          <p
            className={`font-mono text-base font-bold tabular-nums ${
              summary.netServiceEffect > 0
                ? "text-profit-text"
                : summary.netServiceEffect < 0
                ? "text-loss-text"
                : "text-foreground"
            }`}
          >
            {formatSignedRupiah(summary.netServiceEffect)}
          </p>
        </div>
      </div>
    </div>
  );
}
