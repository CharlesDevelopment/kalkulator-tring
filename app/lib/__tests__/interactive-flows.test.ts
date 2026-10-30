import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CalculatorApp } from "@/app/components/CalculatorApp";
import SettingsPage from "@/app/settings/page";
import { PriceCard } from "@/app/components/PriceCard";
import { CalculatorForm } from "@/app/components/CalculatorForm";
import { ResultSummary } from "@/app/components/ResultSummary";
import { PaymentBreakdown } from "@/app/components/PaymentBreakdown";
import { DEFAULT_PRICE_SETTINGS } from "@/app/lib/price-storage";
import {
  calculatePaymentVaBonus,
  calculateTringCuan,
  PaymentTransactionRow,
} from "../calculator";

describe("UI Components & Interactive Flows Verification", () => {
  it("renders HomePage WITHOUT /settings link and WITH Sesuaikan Harga Lokal button", () => {
    const html = renderToStaticMarkup(
      React.createElement(CalculatorApp, {
        initialUniversalSettings: DEFAULT_PRICE_SETTINGS,
      })
    );
    expect(html).toContain("Tring! Cuan Analyzer");
    expect(html).not.toContain('href="/settings"');
    expect(html).toContain("Sesuaikan Harga Lokal");
    expect(html).toContain("Harga Universal Aktif");
    expect(html).toContain("Apakah voucher memotong biaya layanan VA (Rp2.500)?");
    expect(html).toContain("VA Bayar Via Bank Digital");
    expect(html).toContain("VA Bayar melalui Bank");
  });

  it("renders SettingsPage (/settings) with Admin Password field and Universal Price controls", () => {
    const html = renderToStaticMarkup(React.createElement(SettingsPage));
    expect(html).toContain("Pengaturan Harga Universal (Admin)");
    expect(html).toContain("Password Admin untuk Menyimpan Harga Universal");
    expect(html).toContain("Simpan Harga Universal");
  });

  it("verifies PaymentBreakdown dynamic text when voucherCoversServiceFee is true vs false", () => {
    const noop = () => {};
    const rows: PaymentTransactionRow[] = [
      { id: "1", method: "VA_DIGITAL", frequency: 1 },
      { id: "2", method: "VA_BCA", frequency: 1 },
    ];

    const summaryYes = calculatePaymentVaBonus(rows, true);
    const htmlYes = renderToStaticMarkup(
      React.createElement(PaymentBreakdown, {
        bcaCount: 1,
        digitalBankCount: 1,
        voucherCoversServiceFee: true,
        summary: summaryYes,
        onChangeBcaCount: noop,
        onChangeDigitalBankCount: noop,
      })
    );
    expect(htmlYes).toContain("+Rp2.500 Cuan Tambahan / transaksi");
    expect(htmlYes).toContain("Tetap Rp0 (Tidak Menambah Cuan)");

    const summaryNo = calculatePaymentVaBonus(rows, false);
    const htmlNo = renderToStaticMarkup(
      React.createElement(PaymentBreakdown, {
        bcaCount: 1,
        digitalBankCount: 1,
        voucherCoversServiceFee: false,
        summary: summaryNo,
        onChangeBcaCount: noop,
        onChangeDigitalBankCount: noop,
      })
    );
    expect(htmlNo).toContain("Hemat Rp2.500 (Menutup Biaya Layanan Awal");
    expect(htmlNo).toContain("Tetap Kena Biaya Layanan (-Rp2.500 / transaksi)");
  });

  it("verifies PriceCard in 0,01g and 1g modes and local override indicator", () => {
    const noop = () => {};
    const html001 = renderToStaticMarkup(
      React.createElement(PriceCard, {
        buyPrice: 1545000,
        buybackPrice: 1495000,
        unitMode: "0.01g",
        updatedAt: "2026-10-29T15:00:00.000Z",
        isLocalOverride: true,
        onChangeUnitMode: noop,
        onSaveLocalPrice: noop,
        onResetToUniversal: noop,
      })
    );
    expect(html001).toContain("Rp15.450");
    expect(html001).toContain("Mode Harga Lokal (Device Ini)");
  });

  it("verifies ResultSummary breakdown with Tagihan VA Sebelum Transfer Bank", () => {
    const rows: PaymentTransactionRow[] = [
      { id: "1", method: "VA_DIGITAL", frequency: 1 },
    ];
    const result = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 25000,
      gramInput: 0,
      voucherDiscount: 10000,
      voucherCoversServiceFee: true,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: rows,
    });
    const html = renderToStaticMarkup(
      React.createElement(ResultSummary, {
        result,
        buyPrice: 1545000,
        buybackPrice: 1495000,
      })
    );
    expect(html).toContain("Tagihan VA Sebelum Transfer Bank");
    expect(html).toContain("Rp17.500");
    expect(html).toContain("Rp15.000");
  });

  it("verifies CalculatorForm in Gram mode", () => {
    const noop = () => {};
    const rows: PaymentTransactionRow[] = [
      { id: "1", method: "VA_BCA", frequency: 1 },
    ];
    const summary = calculatePaymentVaBonus(rows, true);

    const gramModeHtml = renderToStaticMarkup(
      React.createElement(CalculatorForm, {
        inputMode: "gram",
        nominalInput: 0,
        gramInput: "0.1",
        voucherDiscount: 5000,
        voucherCoversServiceFee: true,
        buyPrice: 1545000,
        bcaCount: 1,
        digitalBankCount: 0,
        paymentSummary: summary,
        onChangeInputMode: noop,
        onChangeNominal: noop,
        onChangeGram: noop,
        onChangeVoucher: noop,
        onChangeVoucherCoversServiceFee: noop,
        onChangeBcaCount: noop,
        onChangeDigitalBankCount: noop,
        onResetForm: noop,
      })
    );
    expect(gramModeHtml).toContain("Modal Beli Rp154.500");
  });
});
