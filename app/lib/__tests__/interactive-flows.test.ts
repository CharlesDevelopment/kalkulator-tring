import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "@/app/page";
import SettingsPage from "@/app/settings/page";
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
  it("renders HomePage with 10k/25k/100k/500k/1jt presets, 2 fixed VA options, and 0,01g/1g toggle", () => {
    const html = renderToStaticMarkup(React.createElement(HomePage));
    expect(html).toContain("Tring! Cuan Analyzer");
    expect(html).toContain("Rp10.000");
    expect(html).toContain("Rp25.000");
    expect(html).toContain("Rp100.000");
    expect(html).toContain("Rp500.000");
    expect(html).toContain("Rp1.000.000");
    expect(html).toContain("VA Bayar Via Bank Digital");
    expect(html).toContain("VA BCA");
    expect(html).toContain("Per 0,01 Gram");
    expect(html).toContain("Per 1 Gram");
    expect(html).toContain("/settings");
  });

  it("renders SettingsPage (/settings) with 0,01g and 1g modes", () => {
    const html = renderToStaticMarkup(React.createElement(SettingsPage));
    expect(html).toContain("Pengaturan Harga Emas Tring!");
    expect(html).toContain("Mode per 0,01 Gram");
    expect(html).toContain("Mode per 1 Gram");
    expect(html).toContain("Simpan Pengaturan Harga");
  });

  it("verifies PriceCard in 0,01g and 1g modes", () => {
    const noop = () => {};
    const html001 = renderToStaticMarkup(
      React.createElement(PriceCard, {
        buyPrice: 1545000,
        buybackPrice: 1495000,
        unitMode: "0.01g",
        updatedAt: "2026-10-29T15:00:00.000Z",
        onChangeUnitMode: noop,
      })
    );
    expect(html001).toContain("Harga Beli Tring! (per 0,01 Gram)");
    expect(html001).toContain("Rp15.450");
    expect(html001).toContain("Rp14.950");

    const html1g = renderToStaticMarkup(
      React.createElement(PriceCard, {
        buyPrice: 1545000,
        buybackPrice: 1495000,
        unitMode: "1g",
        updatedAt: "2026-10-29T15:00:00.000Z",
        onChangeUnitMode: noop,
      })
    );
    expect(html1g).toContain("Harga Beli Tring! (per 1 Gram)");
    expect(html1g).toContain("Rp1.545.000");
    expect(html1g).toContain("Rp1.495.000");
  });

  it("verifies PaymentBreakdown fixed 2 options calculation", () => {
    const noop = () => {};
    const rows: PaymentTransactionRow[] = [
      { id: "1", method: "VA_DIGITAL", frequency: 3 },
      { id: "2", method: "VA_BCA", frequency: 2 },
    ];
    const summary = calculatePaymentVaBonus(rows);
    const html = renderToStaticMarkup(
      React.createElement(PaymentBreakdown, {
        bcaCount: 2,
        digitalBankCount: 3,
        summary,
        onChangeBcaCount: noop,
        onChangeDigitalBankCount: noop,
      })
    );
    expect(html).toContain("VA Bayar Via Bank Digital");
    expect(html).toContain("VA BCA");
    expect(html).toContain("+Rp7.500");
  });

  it("verifies ResultSummary empty state, profit state, and loss state", () => {
    const rows: PaymentTransactionRow[] = [
      { id: "1", method: "VA_BCA", frequency: 2 },
      { id: "2", method: "VA_DIGITAL", frequency: 3 },
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
      nominalInput: 100000,
      gramInput: 0,
      voucherDiscount: 5000,
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
  });

  it("verifies CalculatorForm in Gram mode", () => {
    const noop = () => {};
    const rows: PaymentTransactionRow[] = [
      { id: "1", method: "VA_BCA", frequency: 1 },
    ];
    const summary = calculatePaymentVaBonus(rows);

    const gramModeHtml = renderToStaticMarkup(
      React.createElement(CalculatorForm, {
        inputMode: "gram",
        nominalInput: 0,
        gramInput: "0.1",
        voucherDiscount: 5000,
        buyPrice: 1545000,
        bcaCount: 1,
        digitalBankCount: 0,
        paymentSummary: summary,
        onChangeInputMode: noop,
        onChangeNominal: noop,
        onChangeGram: noop,
        onChangeVoucher: noop,
        onChangeBcaCount: noop,
        onChangeDigitalBankCount: noop,
        onResetForm: noop,
      })
    );
    expect(gramModeHtml).toContain("Modal Beli Rp154.500");
  });
});
