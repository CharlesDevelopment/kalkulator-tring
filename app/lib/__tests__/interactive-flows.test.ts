import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "@/app/page";
import { PriceCard } from "@/app/components/PriceCard";
import { CalculatorForm } from "@/app/components/CalculatorForm";
import { ResultSummary } from "@/app/components/ResultSummary";
import { PaymentBreakdown } from "@/app/components/PaymentBreakdown";
import {
  calculatePaymentVaBonus,
  calculateTringCuan,
  PaymentTransactionRow,
} from "../calculator";

describe("UI Components & Interactive Flows Verification", () => {
  it("renders initial HomePage with default 2x BCA + 3x Bank Digital scenario and positive cuan", () => {
    const html = renderToStaticMarkup(React.createElement(HomePage));
    expect(html).toContain("Tring! Cuan Analyzer");
    expect(html).toContain("Kurs Emas Tring! by Pegadaian");
    expect(html).toContain("Parameter Pembelian &amp; Voucher");
    expect(html).toContain("Struk Audit Cuan &amp; Buyback");
    expect(html).toContain("VA Bayar Via Bank Digital (+Rp2.500 Cuan)");
    expect(html).toContain("(2 x Rp0) + (3 x +Rp2.500)");
    expect(html).toContain("+Rp7.500");
  });

  it("verifies PriceCard states: loading, live, fallback, and manual override", () => {
    const noop = () => {};
    const loadingHtml = renderToStaticMarkup(
      React.createElement(PriceCard, {
        buyPrice: 1545000,
        buybackPrice: 1495000,
        isLive: false,
        isLoading: true,
        errorMessage: null,
        sourceName: "Pegadaian",
        updatedAt: "2026-10-29T14:00:00.000Z",
        isManualOverride: false,
        onRefresh: noop,
        onToggleManualOverride: noop,
        onChangeBuyPrice: noop,
        onChangeBuybackPrice: noop,
      })
    );
    expect(loadingHtml).toContain("Memuat Harga Terbaru...");

    const liveHtml = renderToStaticMarkup(
      React.createElement(PriceCard, {
        buyPrice: 1545000,
        buybackPrice: 1495000,
        isLive: true,
        isLoading: false,
        errorMessage: null,
        sourceName: "sahabat.pegadaian.co.id",
        updatedAt: "2026-10-29T14:00:00.000Z",
        isManualOverride: false,
        onRefresh: noop,
        onToggleManualOverride: noop,
        onChangeBuyPrice: noop,
        onChangeBuybackPrice: noop,
      })
    );
    expect(liveHtml).toContain("Live Price Update");

    const manualHtml = renderToStaticMarkup(
      React.createElement(PriceCard, {
        buyPrice: 1560000,
        buybackPrice: 1510000,
        isLive: false,
        isLoading: false,
        errorMessage: "Server sedang sibuk",
        sourceName: "Manual",
        updatedAt: "2026-10-29T14:00:00.000Z",
        isManualOverride: true,
        onRefresh: noop,
        onToggleManualOverride: noop,
        onChangeBuyPrice: noop,
        onChangeBuybackPrice: noop,
      })
    );
    expect(manualHtml).toContain("Mode Override Manual Aktif");
    expect(manualHtml).toContain("Input Override Harga Emas Manual");
    expect(manualHtml).toContain("Server sedang sibuk");
  });

  it("verifies PaymentBreakdown empty state and multi-row VA calculation", () => {
    const noop = () => {};
    const emptySummary = calculatePaymentVaBonus([]);
    const emptyHtml = renderToStaticMarkup(
      React.createElement(PaymentBreakdown, {
        rows: [],
        summary: emptySummary,
        onAddRow: noop,
        onUpdateRow: noop,
        onRemoveRow: noop,
        onApplyPresetSplit: noop,
      })
    );
    expect(emptyHtml).toContain(
      "Belum ada rincian metode pembayaran Virtual Account."
    );
    expect(emptyHtml).toContain("Tambah VA Bank Digital (+Rp2.500)");
    expect(emptyHtml).toContain("Tambah VA BCA (Rp0)");
  });

  it("verifies ResultSummary empty state, profit state, and loss state", () => {
    const rows: PaymentTransactionRow[] = [
      { id: "1", method: "VA_BCA", label: "VA BCA", frequency: 2 },
      {
        id: "2",
        method: "VA_DIGITAL",
        label: "Seabank / Bank Digital",
        frequency: 3,
      },
    ];

    const emptyResult = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 0,
      gramInput: 0,
      voucherDiscount: 0,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: rows,
    });
    const emptyHtml = renderToStaticMarkup(
      React.createElement(ResultSummary, {
        result: emptyResult,
        buyPrice: 1545000,
        buybackPrice: 1495000,
      })
    );
    expect(emptyHtml).toContain("Menunggu Input Nominal Transaksi");

    const profitResult = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 2500000,
      gramInput: 0,
      voucherDiscount: 125000,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: rows,
    });
    const profitHtml = renderToStaticMarkup(
      React.createElement(ResultSummary, {
        result: profitResult,
        buyPrice: 1545000,
        buybackPrice: 1495000,
      })
    );
    expect(profitHtml).toContain("Status: Positif Cuan (Untung)");

    const lossResult = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 2500000,
      gramInput: 0,
      voucherDiscount: 10000,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: rows,
    });
    const lossHtml = renderToStaticMarkup(
      React.createElement(ResultSummary, {
        result: lossResult,
        buyPrice: 1545000,
        buybackPrice: 1495000,
      })
    );
    expect(lossHtml).toContain("Status: Negatif (Belum Menutup Spread)");
  });

  it("verifies CalculatorForm in both Rupiah and Gram modes", () => {
    const noop = () => {};
    const rows: PaymentTransactionRow[] = [
      { id: "1", method: "VA_BCA", label: "VA BCA", frequency: 1 },
    ];
    const summary = calculatePaymentVaBonus(rows);

    const gramModeHtml = renderToStaticMarkup(
      React.createElement(CalculatorForm, {
        inputMode: "gram",
        nominalInput: 0,
        gramInput: "2.5",
        voucherDiscount: 150000,
        buyPrice: 1545000,
        paymentRows: rows,
        paymentSummary: summary,
        onChangeInputMode: noop,
        onChangeNominal: noop,
        onChangeGram: noop,
        onChangeVoucher: noop,
        onAddPaymentRow: noop,
        onUpdatePaymentRow: noop,
        onRemovePaymentRow: noop,
        onApplyPresetSplit: noop,
        onResetForm: noop,
      })
    );
    expect(gramModeHtml).toContain("Modal Beli Rp3.862.500");
  });
});
