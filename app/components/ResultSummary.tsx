"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { TringCalculationResult } from "@/app/lib/calculator";
import {
  formatRupiah,
  formatSignedRupiah,
  formatGram,
  formatPercentage,
} from "@/app/lib/format";

export interface ResultSummaryProps {
  result: TringCalculationResult;
  buyPrice: number;
  buybackPrice: number;
}

export function ResultSummary({
  result,
  buyPrice,
  buybackPrice,
}: ResultSummaryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAudit = async () => {
    if (!result.isValid) return;
    const statusText = result.isProfitable ? "CUAN BERSIH" : "SELISIH RUGI";
    const text = [
      `=== AUDIT CUAN EMAS TRING! BY PEGADAIAN ===`,
      `Status: ${statusText} (${formatSignedRupiah(result.netProfit)} | ROI ${formatPercentage(result.roiPercentage)})`,
      `Harga Beli Acuan: ${formatRupiah(buyPrice)} /g`,
      `Harga Buyback Acuan: ${formatRupiah(buybackPrice)} /g`,
      `-------------------------------------------`,
      `1. Modal Awal Pembelian: ${formatRupiah(result.modalBeli)}`,
      `2. Biaya Layanan VA Awal (${result.vaBonusSummary.totalTransactions}x Rp2.500): +${formatRupiah(result.vaBonusSummary.initialServiceFee)}`,
      `3. Total Hemat Voucher: -${formatRupiah(result.voucherDiscount)} (${result.voucherCoversServiceFee ? `Potong Emas ${formatRupiah(result.voucherGoldPortion)} + Biaya Layanan ${formatRupiah(result.voucherFeePortion)}` : "Tidak memotong biaya layanan"})`,
      `4. Tagihan Awal VA: ${formatRupiah(result.tagihanAwalVa)}`,
      `5. Hemat Transfer VA Bank Digital: -${formatRupiah(result.vaBonusSummary.totalVaBonus)}`,
      `6. Total Transfer Bersih (Net Modal): ${formatRupiah(result.netModal)}`,
      `7. Total Emas Diperoleh: ${formatGram(result.totalGram)}`,
      `8. Proyeksi Uang Diterima (Langsung Buyback): ${formatRupiah(result.buybackValue)}`,
      `9. Selisih Bersih (Net Cuan/Rugi): ${formatSignedRupiah(result.netProfit)}`,
      `-------------------------------------------`,
      `* Disclaimer: Hasil bersifat simulasi dan estimasi. Nilai riil di aplikasi Tring! Pegadaian bisa saja terdapat selisih pembulatan atau perubahan kurs realtime.`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (!result.isValid) {
    return (
      <Card aria-label="Ringkasan Hasil Kalkulasi Cuan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-muted" aria-hidden="true" />
            <span>Struk Audit Cuan & Buyback</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            role="status"
            className="rounded-md border border-dashed border-border-control bg-surface-subtle p-6 text-center"
          >
            <AlertCircle
              className="mx-auto h-8 w-8 text-muted"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-bold text-foreground">
              Menunggu Input Nominal Transaksi
            </p>
            <p className="mt-1 text-xs text-muted">
              {result.validationMessage ||
                "Masukkan nominal modal pembelian atau pilih tombol nominal cepat di sebelah kiri untuk menampilkan kalkulasi Net Cuan dan ROI secara langsung."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxBarValue = Math.max(result.netModal, result.buybackValue, 1);
  const netModalWidthPct = Math.min(
    100,
    Math.max(8, (result.netModal / maxBarValue) * 100)
  );
  const buybackWidthPct = Math.min(
    100,
    Math.max(8, (result.buybackValue / maxBarValue) * 100)
  );

  return (
    <Card aria-label="Ringkasan Hasil Kalkulasi Cuan" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-muted" aria-hidden="true" />
            <span>Struk Audit Cuan & Buyback</span>
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted">
            Kalkulasi transparan jika emas langsung dijual (buyback) saat ini
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyAudit}
          aria-label="Salin rincian hasil perhitungan ke clipboard"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-profit-text" aria-hidden="true" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span>Salin Struk</span>
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        <div
          role="region"
          aria-label="Status Kinerja Cuan"
          className={`rounded-lg border-2 p-4 ${
            result.isProfitable
              ? "border-profit-border bg-profit-bg text-profit-text"
              : "border-loss-border bg-loss-bg text-loss-text"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              {result.isProfitable ? (
                <>
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  <span>Status: Positif Cuan (Untung)</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />
                  <span>Status: Negatif (Belum Menutup Spread)</span>
                </>
              )}
            </span>

            <span className="rounded border border-current px-2 py-0.5 font-mono text-xs font-bold tabular-nums">
              ROI {formatPercentage(result.roiPercentage)}
            </span>
          </div>

          <p className="mt-2 font-mono text-2xl font-bold tabular-nums sm:text-3xl break-words [overflow-wrap:anywhere]">
            {formatSignedRupiah(result.netProfit)}
          </p>
          {result.vaBonusSummary.totalTransactions > 1 && (
            <p className="mt-0.5 font-mono text-xs font-bold tabular-nums opacity-90 break-words [overflow-wrap:anywhere]">
              ({formatSignedRupiah(result.netProfitPerTx)} / transaksi ×{" "}
              {result.vaBonusSummary.totalTransactions}x transaksi)
            </p>
          )}

          <p className="mt-1.5 text-xs font-medium opacity-95 break-words [overflow-wrap:anywhere]">
            {result.isProfitable
              ? `Kombinasi voucher dan metode pembayaran VA berhasil menutup spread harga emas dengan keuntungan bersih ${formatRupiah(result.netProfit)}.`
              : `Dibutuhkan minimal voucher ${formatRupiah(result.breakEvenVoucher)} (kurang ${formatRupiah(Math.max(0, result.breakEvenVoucher - result.voucherDiscount))} lagi) untuk mencapai titik impas (Rp0).`}
          </p>
        </div>

        <div className="space-y-2.5 rounded-md border border-border bg-surface-subtle p-3.5 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-semibold">
            <span className="text-foreground">
              Pita Perbandingan Transfer Bersih vs Nilai Buyback
            </span>
            <span className="font-mono tabular-nums text-muted break-words">
              Impas Voucher: {formatRupiah(result.breakEvenVoucher)}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="text-muted min-w-0">Total Transfer Bersih (Net Modal)</span>
                <span className="font-mono font-bold tabular-nums text-foreground shrink-0 text-right">
                  {formatRupiah(result.netModal)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-sm bg-background border border-border-control">
                <div
                  className="h-full bg-foreground transition-all"
                  style={{ width: `${netModalWidthPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="text-muted min-w-0">Hasil Penjualan (Buyback)</span>
                <span className="font-mono font-bold tabular-nums text-foreground shrink-0 text-right">
                  {formatRupiah(result.buybackValue)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-sm bg-background border border-border-control">
                <div
                  className={`h-full transition-all ${
                    result.isProfitable ? "bg-accent" : "bg-loss-border"
                  }`}
                  style={{ width: `${buybackWidthPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Breakdown Rincian Transaksi & Rumus
          </h3>

          <dl className="divide-y divide-border rounded-md border border-border bg-background text-sm">
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0 pr-1">
                <dt className="text-muted">
                  Modal Awal Pembelian Emas ({result.vaBonusSummary.totalTransactions}x)
                </dt>
                {result.vaBonusSummary.totalTransactions > 1 && (
                  <span className="block font-mono text-[11px] tabular-nums text-muted">
                    {result.vaBonusSummary.totalTransactions}x × {formatRupiah(result.modalBeliPerTx)}
                  </span>
                )}
              </div>
              <dd className="shrink-0 text-right font-mono font-semibold tabular-nums text-foreground">
                {formatRupiah(result.modalBeli)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0 pr-1">
                <dt className="text-muted">
                  Biaya Layanan VA Awal ({result.vaBonusSummary.totalTransactions}x Rp2.500)
                </dt>
                <span className="block text-[11px] text-muted">
                  Diterapkan dari awal pada setiap transaksi VA
                </span>
              </div>
              <dd className="shrink-0 text-right font-mono font-semibold tabular-nums text-loss-text">
                +{formatRupiah(result.vaBonusSummary.initialServiceFee)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0 pr-1">
                <dt className="text-muted">
                  Total Potongan Voucher ({result.vaBonusSummary.totalTransactions}x)
                </dt>
                <span className="block text-[11px] text-muted">
                  {result.vaBonusSummary.totalTransactions > 1
                    ? `${result.vaBonusSummary.totalTransactions}x × ${formatRupiah(result.voucherDiscountPerTx)} · `
                    : ""}
                  {result.voucherCoversServiceFee
                    ? `Potong Biaya Layanan ${formatRupiah(result.voucherFeePortion)} + Emas ${formatRupiah(result.voucherGoldPortion)}`
                    : "Voucher tidak memotong biaya layanan VA"}
                </span>
              </div>
              <dd className="shrink-0 text-right font-mono font-semibold tabular-nums text-profit-text">
                -{formatRupiah(result.voucherDiscount)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0 pr-1">
                <dt className="font-medium text-foreground">
                  Tagihan VA Sebelum Transfer Bank
                </dt>
                <span className="block text-[11px] text-muted">
                  Modal Beli + Biaya Layanan VA Awal - Voucher
                </span>
              </div>
              <dd className="shrink-0 text-right font-mono font-semibold tabular-nums text-foreground">
                {formatRupiah(result.tagihanAwalVa)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0 pr-1">
                <dt className="text-muted">
                  Hemat Transfer via VA Bank Digital ({result.vaBonusSummary.digitalBankCount}x)
                </dt>
                <span className="block font-mono text-[11px] tabular-nums text-muted">
                  {result.voucherCoversServiceFee
                    ? `Menjadi +${formatRupiah(result.vaBonusSummary.totalVaBonus)} Cuan Tambahan karena biaya layanan sudah dipotong voucher`
                    : `Menutup biaya layanan VA awal (bukan cuan tambahan)`}
                </span>
              </div>
              <dd className="shrink-0 text-right font-mono font-semibold tabular-nums text-profit-text">
                -{formatRupiah(result.vaBonusSummary.totalVaBonus)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 bg-surface-subtle px-3.5 py-3">
              <div className="min-w-0 pr-1">
                <dt className="font-bold text-foreground">
                  Total Transfer Bersih (Net Modal)
                </dt>
                <span className="block text-[11px] text-muted">
                  Nominal uang riil yang keluar dari rekening Anda
                </span>
              </div>
              <dd className="shrink-0 text-right font-mono text-base font-bold tabular-nums text-foreground">
                {formatRupiah(result.netModal)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0 pr-1">
                <dt className="text-muted">Total Emas yang Diperoleh</dt>
                <span className="block font-mono text-[11px] tabular-nums text-muted break-words">
                  {formatRupiah(result.modalBeli)} / {formatRupiah(buyPrice)}
                </span>
              </div>
              <dd className="shrink-0 rounded border border-gold-border bg-gold-bg px-2 py-0.5 font-mono font-bold tabular-nums text-gold-text">
                {formatGram(result.totalGram)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0 pr-1">
                <dt className="text-muted">
                  Proyeksi Uang Diterima (Langsung Buyback)
                </dt>
                <span className="block font-mono text-[11px] tabular-nums text-muted break-words">
                  {formatGram(result.totalGram)} × {formatRupiah(buybackPrice)}
                </span>
              </div>
              <dd className="shrink-0 text-right font-mono text-base font-bold tabular-nums text-foreground">
                {formatRupiah(result.buybackValue)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3 bg-surface-subtle px-3.5 py-3">
              <div className="min-w-0 pr-1">
                <dt className="font-bold text-foreground">
                  Selisih Bersih (Net Cuan / Rugi)
                </dt>
                <span className="block text-[11px] text-muted">
                  Nilai Penjualan Buyback - Total Transfer Bersih
                </span>
              </div>
              <dd
                className={`shrink-0 text-right font-mono text-base font-bold tabular-nums ${
                  result.isProfitable ? "text-profit-text" : "text-loss-text"
                }`}
              >
                {formatSignedRupiah(result.netProfit)} (
                {formatPercentage(result.roiPercentage)})
              </dd>
            </div>
          </dl>

          <div
            role="note"
            aria-label="Catatan disclaimer kalkulator"
            className="flex items-start gap-2.5 rounded-md border border-warn-border bg-warn-bg/90 p-3 text-xs leading-relaxed text-warn-text"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-warn-text mt-0.5" aria-hidden="true" />
            <p>
              <strong>Disclaimer:</strong> Kalkulator ini bersifat estimasi dan simulasi. Hasil riil pada aplikasi Tring! by Pegadaian bisa saja terdapat selisih akibat pembulatan internal sistem atau fluktuasi kurs emas realtime saat Anda mengeksekusi transaksi.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
