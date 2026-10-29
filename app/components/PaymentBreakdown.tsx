"use client";

import React from "react";
import { Plus, Trash2, Landmark } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  PaymentMethodType,
  PaymentTransactionRow,
  PaymentFeeSummary,
  VA_FEE_RATES,
} from "@/app/lib/calculator";
import { formatRupiah } from "@/app/lib/format";

export interface PaymentBreakdownProps {
  rows: PaymentTransactionRow[];
  summary: PaymentFeeSummary;
  onAddRow: (method?: PaymentMethodType, label?: string, frequency?: number) => void;
  onUpdateRow: (
    id: string,
    updates: Partial<Omit<PaymentTransactionRow, "id">>
  ) => void;
  onRemoveRow: (id: string) => void;
  onApplyPresetSplit: (bcaFreq: number, otherFreq: number) => void;
}

export function PaymentBreakdown({
  rows,
  summary,
  onAddRow,
  onUpdateRow,
  onRemoveRow,
  onApplyPresetSplit,
}: PaymentBreakdownProps) {
  return (
    <div className="space-y-4 border-t border-border pt-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Landmark className="h-4 w-4 text-muted" aria-hidden="true" />
            <span>Rincian Multi-Transaksi Pembayaran (Biaya Admin VA)</span>
          </h3>
          <p className="text-xs text-muted">
            VA BCA dikenakan Rp0/transaksi. VA Bank Lain (BRI, Mandiri, BNI, Permata, dll.) dikenakan Rp2.500/transaksi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={() => onApplyPresetSplit(2, 3)}
            title="Terapkan contoh: 2x VA BCA + 3x VA BRI (Bank Lain)"
          >
            Contoh: 2x BCA + 3x BRI
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddRow("VA_OTHER", "VA Bank Lain", 1)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Tambah Baris VA</span>
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div
          role="status"
          className="rounded-md border border-dashed border-border-control bg-surface-subtle p-4 text-center"
        >
          <p className="text-sm font-semibold text-foreground">
            Belum ada rincian metode pembayaran Virtual Account.
          </p>
          <p className="mt-1 text-xs text-muted">
            Tambahkan baris pembayaran untuk menghitung total biaya admin VA secara otomatis.
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onAddRow("VA_BCA", "VA BCA", 1)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah VA BCA (Rp0)</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddRow("VA_OTHER", "VA BRI / Bank Lain", 1)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah VA Bank Lain (+Rp2.500)</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => {
            const unitFee = VA_FEE_RATES[row.method];
            const rowSubtotal = Math.max(0, row.frequency) * unitFee;
            const methodSelectId = `va-method-${row.id}`;
            const labelInputId = `va-label-${row.id}`;
            const freqInputId = `va-freq-${row.id}`;

            return (
              <div
                key={row.id}
                className="grid grid-cols-1 gap-3 rounded-md border border-border bg-surface-subtle p-3.5 sm:grid-cols-12 sm:items-end"
              >
                <div className="sm:col-span-5">
                  <Label htmlFor={methodSelectId} className="mb-1.5 block text-xs">
                    Metode Pembayaran #{index + 1}
                  </Label>
                  <select
                    id={methodSelectId}
                    value={row.method}
                    onChange={(e) => {
                      const nextMethod = e.target.value as PaymentMethodType;
                      const defaultLabel =
                        nextMethod === "VA_BCA" ? "VA BCA" : "VA BRI / Bank Lain";
                      onUpdateRow(row.id, {
                        method: nextMethod,
                        label: defaultLabel,
                      });
                    }}
                    className="flex min-h-[44px] w-full rounded-md border border-border-control bg-surface px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <option value="VA_BCA">VA BCA (Biaya Tetap Rp0)</option>
                    <option value="VA_OTHER">
                      VA Bank Lain (+Rp2.500 / transaksi)
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <Label htmlFor={labelInputId} className="mb-1.5 block text-xs">
                    Catatan Bank (Opsional)
                  </Label>
                  <Input
                    id={labelInputId}
                    type="text"
                    className="font-sans text-sm"
                    placeholder="Contoh: VA BRI / Mandiri"
                    value={row.label}
                    onChange={(e) =>
                      onUpdateRow(row.id, { label: e.target.value })
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor={freqInputId} className="mb-1.5 block text-xs">
                    Frekuensi (Kali)
                  </Label>
                  <Input
                    id={freqInputId}
                    type="number"
                    min={0}
                    max={999}
                    inputMode="numeric"
                    value={row.frequency.toString()}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value, 10);
                      onUpdateRow(row.id, {
                        frequency: Number.isNaN(val) ? 0 : Math.max(0, val),
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 sm:col-span-2 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="block text-[11px] font-medium text-muted">
                      Subtotal Admin
                    </span>
                    <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                      {formatRupiah(rowSubtotal)}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    onClick={() => onRemoveRow(row.id)}
                    aria-label={`Hapus baris pembayaran ke-${index + 1}`}
                    title="Hapus baris pembayaran ini"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col justify-between gap-2 rounded-md border border-border bg-background px-4 py-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-muted">
            Rumus Otomatis Biaya Admin VA ({summary.totalTransactions}x Transaksi):
          </span>
          <p className="font-mono text-xs font-semibold tabular-nums text-foreground sm:text-sm">
            {summary.formulaText} = {formatRupiah(summary.totalAdminFee)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs text-muted">Total Biaya Admin VA</span>
          <p className="font-mono text-base font-bold tabular-nums text-foreground">
            {formatRupiah(summary.totalAdminFee)}
          </p>
        </div>
      </div>
    </div>
  );
}
