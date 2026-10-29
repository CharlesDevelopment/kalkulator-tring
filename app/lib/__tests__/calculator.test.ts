import { describe, it, expect } from "vitest";
import {
  calculatePaymentVaBonus,
  calculateTringCuan,
} from "../calculator";

describe("calculatePaymentVaBonus", () => {
  it("calculates initial service fee (2500/tx) and Bank Digital savings accurately", () => {
    const summaryYes = calculatePaymentVaBonus(
      [
        { id: "1", method: "VA_BCA", frequency: 2 },
        { id: "2", method: "VA_DIGITAL", frequency: 3 },
      ],
      true
    );

    expect(summaryYes.bcaCount).toBe(2);
    expect(summaryYes.digitalBankCount).toBe(3);
    expect(summaryYes.totalTransactions).toBe(5);
    expect(summaryYes.initialServiceFee).toBe(12500);
    expect(summaryYes.totalVaBonus).toBe(7500);
    expect(summaryYes.netServiceEffect).toBe(7500);

    const summaryNo = calculatePaymentVaBonus(
      [
        { id: "1", method: "VA_BCA", frequency: 2 },
        { id: "2", method: "VA_DIGITAL", frequency: 3 },
      ],
      false
    );
    // 3x Digital saves 7.500 out of 12.500 initial fee -> net effect -5.000 (from the 2x conventional bank)
    expect(summaryNo.netServiceEffect).toBe(-5000);
  });
});

describe("calculateTringCuan", () => {
  it("matches exact user example 1: Beli 25k, Voucher 15k (12.5k + 2.5k fee) -> Tagihan Awal 12.500 -> via Bank Digital transfer 10.000", () => {
    const result = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 25000,
      gramInput: 0,
      voucherDiscount: 15000,
      voucherCoversServiceFee: true,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: [{ id: "1", method: "VA_DIGITAL", frequency: 1 }],
    });

    expect(result.modalBeli).toBe(25000);
    expect(result.vaBonusSummary.initialServiceFee).toBe(2500);
    expect(result.tagihanAwalVa).toBe(12500);
    expect(result.netModal).toBe(10000);
    expect(result.voucherFeePortion).toBe(2500);
    expect(result.voucherGoldPortion).toBe(12500);
  });

  it("matches exact user example 2: Beli 25k tanpa voucher -> Tagihan Awal 27.500 -> via Bank Digital transfer 25.000, via Bank Konvensional transfer 27.500", () => {
    const viaDigital = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 25000,
      gramInput: 0,
      voucherDiscount: 0,
      voucherCoversServiceFee: false,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: [{ id: "1", method: "VA_DIGITAL", frequency: 1 }],
    });

    expect(viaDigital.tagihanAwalVa).toBe(27500);
    expect(viaDigital.netModal).toBe(25000);

    const viaConventional = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 25000,
      gramInput: 0,
      voucherDiscount: 0,
      voucherCoversServiceFee: false,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: [{ id: "1", method: "VA_BCA", frequency: 1 }],
    });

    expect(viaConventional.tagihanAwalVa).toBe(27500);
    expect(viaConventional.netModal).toBe(27500);
  });

  it("matches exact user example 3: Beli 25k, Voucher 10k tidak potong biaya layanan -> Tagihan Awal 17.500 -> via Bank Digital transfer 15.000", () => {
    const result = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 25000,
      gramInput: 0,
      voucherDiscount: 10000,
      voucherCoversServiceFee: false,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: [{ id: "1", method: "VA_DIGITAL", frequency: 1 }],
    });

    expect(result.tagihanAwalVa).toBe(17500);
    expect(result.netModal).toBe(15000);
  });
});
