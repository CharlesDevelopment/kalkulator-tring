import { describe, it, expect } from "vitest";
import {
  calculatePaymentVaBonus,
  calculateTringCuan,
} from "../calculator";

describe("calculatePaymentVaBonus", () => {
  it("calculates 2x VA BCA + 3x VA Bayar Via Bank Digital as +Rp7.500 profit bonus", () => {
    const summary = calculatePaymentVaBonus([
      { id: "1", method: "VA_BCA", label: "VA BCA", frequency: 2 },
      {
        id: "2",
        method: "VA_DIGITAL",
        label: "Seabank / Bank Digital",
        frequency: 3,
      },
    ]);

    expect(summary.bcaCount).toBe(2);
    expect(summary.digitalBankCount).toBe(3);
    expect(summary.totalTransactions).toBe(5);
    expect(summary.totalVaBonus).toBe(7500);
    expect(summary.formulaText).toBe("(2 x Rp0) + (3 x +Rp2.500)");
  });

  it("handles empty payment rows cleanly", () => {
    const summary = calculatePaymentVaBonus([]);
    expect(summary.totalVaBonus).toBe(0);
    expect(summary.totalTransactions).toBe(0);
  });
});

describe("calculateTringCuan", () => {
  it("calculates total gram, net modal, buyback value, net cuan (+2500 per VA Digital), and ROI accurately in Rupiah mode", () => {
    const result = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 2500000,
      gramInput: 0,
      voucherDiscount: 125000,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: [
        { id: "1", method: "VA_BCA", label: "VA BCA", frequency: 2 },
        {
          id: "2",
          method: "VA_DIGITAL",
          label: "Seabank / Bank Digital",
          frequency: 3,
        },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.modalBeli).toBe(2500000);
    expect(result.totalGram).toBeCloseTo(2500000 / 1545000, 6);
    expect(result.vaBonusSummary.totalVaBonus).toBe(7500);
    // Net Modal berkurang karena voucher (125.000) dan hemat admin VA Bank Digital (7.500)
    expect(result.netModal).toBe(2500000 - 125000 - 7500); // 2,367,500
    expect(result.buybackValue).toBe(
      Math.round((2500000 / 1545000) * 1495000)
    );
    expect(result.netProfit).toBe(result.buybackValue - result.netModal);
    expect(result.isProfitable).toBe(true);
  });

  it("calculates accurately in Gram mode and adds +Rp2.500 per VA Digital transaction to profit", () => {
    const result = calculateTringCuan({
      inputMode: "gram",
      nominalInput: 0,
      gramInput: 1.0,
      voucherDiscount: 10000,
      buyPricePerGram: 1550000,
      buybackPricePerGram: 1500000,
      paymentRows: [
        { id: "1", method: "VA_DIGITAL", label: "Seabank", frequency: 2 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.modalBeli).toBe(1550000);
    expect(result.totalGram).toBe(1.0);
    // 2x VA Digital = +5.000 cuan (mengurangi netModal sebanyak 5.000)
    expect(result.netModal).toBe(1550000 - 10000 - 5000); // 1,535,000
    expect(result.buybackValue).toBe(1500000);
    expect(result.netProfit).toBe(-35000);
    expect(result.isProfitable).toBe(false);
    expect(result.breakEvenVoucher).toBe(45000);
  });
});
