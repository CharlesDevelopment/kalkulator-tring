import { describe, it, expect } from "vitest";
import {
  calculatePaymentAdminFees,
  calculateTringCuan,
} from "../calculator";

describe("calculatePaymentAdminFees", () => {
  it("calculates 2x VA BCA + 3x VA BRI (Bank Lain) as Rp7.500", () => {
    const summary = calculatePaymentAdminFees([
      { id: "1", method: "VA_BCA", label: "VA BCA", frequency: 2 },
      { id: "2", method: "VA_OTHER", label: "VA BRI", frequency: 3 },
    ]);

    expect(summary.bcaCount).toBe(2);
    expect(summary.otherBankCount).toBe(3);
    expect(summary.totalTransactions).toBe(5);
    expect(summary.totalAdminFee).toBe(7500);
    expect(summary.formulaText).toBe("(2 x Rp0) + (3 x Rp2.500)");
  });

  it("handles empty payment rows cleanly", () => {
    const summary = calculatePaymentAdminFees([]);
    expect(summary.totalAdminFee).toBe(0);
    expect(summary.totalTransactions).toBe(0);
  });
});

describe("calculateTringCuan", () => {
  it("calculates total gram, net modal, buyback value, net cuan, and ROI accurately in Rupiah mode", () => {
    const result = calculateTringCuan({
      inputMode: "rupiah",
      nominalInput: 2500000,
      gramInput: 0,
      voucherDiscount: 125000,
      buyPricePerGram: 1545000,
      buybackPricePerGram: 1495000,
      paymentRows: [
        { id: "1", method: "VA_BCA", label: "VA BCA", frequency: 2 },
        { id: "2", method: "VA_OTHER", label: "VA BRI", frequency: 3 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.modalBeli).toBe(2500000);
    expect(result.totalGram).toBeCloseTo(2500000 / 1545000, 6);
    expect(result.adminFeeSummary.totalAdminFee).toBe(7500);
    expect(result.netModal).toBe(2500000 - 125000 + 7500); // 2,382,500
    expect(result.buybackValue).toBe(
      Math.round((2500000 / 1545000) * 1495000)
    );
    expect(result.netProfit).toBe(result.buybackValue - result.netModal);
    expect(result.isProfitable).toBe(true);
  });

  it("calculates accurately in Gram mode and detects loss when voucher does not cover spread", () => {
    const result = calculateTringCuan({
      inputMode: "gram",
      nominalInput: 0,
      gramInput: 1.0,
      voucherDiscount: 10000,
      buyPricePerGram: 1550000,
      buybackPricePerGram: 1500000,
      paymentRows: [
        { id: "1", method: "VA_OTHER", label: "VA Mandiri", frequency: 2 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.modalBeli).toBe(1550000);
    expect(result.totalGram).toBe(1.0);
    expect(result.netModal).toBe(1550000 - 10000 + 5000); // 1,545,000
    expect(result.buybackValue).toBe(1500000);
    expect(result.netProfit).toBe(-45000);
    expect(result.isProfitable).toBe(false);
    expect(result.breakEvenVoucher).toBe(55000);
  });
});
