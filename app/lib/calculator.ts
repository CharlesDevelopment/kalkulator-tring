export type InputMode = "rupiah" | "gram";

export type PaymentMethodType = "VA_BCA" | "VA_DIGITAL";

export interface PaymentTransactionRow {
  id: string;
  method: PaymentMethodType;
  label: string;
  frequency: number;
}

export interface TringCalculationInput {
  inputMode: InputMode;
  nominalInput: number;
  gramInput: number;
  voucherDiscount: number;
  buyPricePerGram: number;
  buybackPricePerGram: number;
  paymentRows: PaymentTransactionRow[];
}

export interface PaymentBonusSummary {
  totalTransactions: number;
  bcaCount: number;
  digitalBankCount: number;
  totalVaBonus: number;
  formulaText: string;
}

export interface TringCalculationResult {
  modalBeli: number;
  totalGram: number;
  voucherDiscount: number;
  vaBonusSummary: PaymentBonusSummary;
  netModal: number;
  buybackValue: number;
  netProfit: number;
  roiPercentage: number;
  spreadPerGram: number;
  spreadPercentage: number;
  breakEvenVoucher: number;
  isProfitable: boolean;
  isValid: boolean;
  validationMessage: string | null;
}

export const VA_BONUS_RATES: Record<PaymentMethodType, number> = {
  VA_BCA: 0,
  VA_DIGITAL: 2500,
};

export function calculatePaymentVaBonus(
  rows: PaymentTransactionRow[]
): PaymentBonusSummary {
  let bcaCount = 0;
  let digitalBankCount = 0;

  for (const row of rows) {
    const freq = Math.max(
      0,
      Math.floor(Number.isFinite(row.frequency) ? row.frequency : 0)
    );
    if (row.method === "VA_BCA") {
      bcaCount += freq;
    } else {
      digitalBankCount += freq;
    }
  }

  const totalVaBonus =
    bcaCount * VA_BONUS_RATES.VA_BCA +
    digitalBankCount * VA_BONUS_RATES.VA_DIGITAL;
  const totalTransactions = bcaCount + digitalBankCount;

  const parts: string[] = [];
  if (bcaCount > 0 || digitalBankCount === 0) {
    parts.push(`(${bcaCount} x Rp0)`);
  }
  if (digitalBankCount > 0) {
    parts.push(`(${digitalBankCount} x +Rp2.500)`);
  }

  const formulaText = parts.length > 0 ? parts.join(" + ") : "(0 x Rp0)";

  return {
    totalTransactions,
    bcaCount,
    digitalBankCount,
    totalVaBonus,
    formulaText,
  };
}

export function calculateTringCuan(
  input: TringCalculationInput
): TringCalculationResult {
  const vaBonusSummary = calculatePaymentVaBonus(input.paymentRows);
  const buyPrice = Number.isFinite(input.buyPricePerGram)
    ? input.buyPricePerGram
    : 0;
  const buybackPrice = Number.isFinite(input.buybackPricePerGram)
    ? input.buybackPricePerGram
    : 0;

  if (buyPrice <= 0 || buybackPrice <= 0) {
    return {
      modalBeli: 0,
      totalGram: 0,
      voucherDiscount: 0,
      vaBonusSummary,
      netModal: 0,
      buybackValue: 0,
      netProfit: 0,
      roiPercentage: 0,
      spreadPerGram: 0,
      spreadPercentage: 0,
      breakEvenVoucher: 0,
      isProfitable: false,
      isValid: false,
      validationMessage:
        "Harga Beli dan Harga Buyback harus lebih besar dari Rp0 per gram.",
    };
  }

  const rawModalBeli =
    input.inputMode === "rupiah"
      ? Math.max(0, input.nominalInput)
      : Math.max(0, input.gramInput) * buyPrice;

  const modalBeli = Math.round(rawModalBeli);
  const totalGram =
    input.inputMode === "gram"
      ? Math.max(0, input.gramInput)
      : modalBeli / buyPrice;

  const voucherDiscount = Math.max(
    0,
    Math.min(modalBeli, Math.round(input.voucherDiscount))
  );

  if (modalBeli <= 0 || totalGram <= 0) {
    return {
      modalBeli: 0,
      totalGram: 0,
      voucherDiscount: 0,
      vaBonusSummary,
      netModal: 0,
      buybackValue: 0,
      netProfit: 0,
      roiPercentage: 0,
      spreadPerGram: buyPrice - buybackPrice,
      spreadPercentage: ((buyPrice - buybackPrice) / buyPrice) * 100,
      breakEvenVoucher: 0,
      isProfitable: false,
      isValid: false,
      validationMessage:
        "Masukkan nominal pembelian Rupiah atau berat gram emas di atas 0 untuk melihat hasil audit cuan.",
    };
  }

  // VA Bayar Via Bank Digital memberikan hemat free admin +Rp2.500/transaksi sehingga mengurangi Net Modal (menambah Net Cuan +Rp2.500/transaksi)
  const netModal = Math.max(
    0,
    modalBeli - voucherDiscount - vaBonusSummary.totalVaBonus
  );
  const buybackValue = Math.round(totalGram * buybackPrice);
  const netProfit = buybackValue - netModal;
  const roiPercentage = netModal > 0 ? (netProfit / netModal) * 100 : 0;

  const spreadPerGram = buyPrice - buybackPrice;
  const spreadPercentage = (spreadPerGram / buyPrice) * 100;
  const breakEvenVoucher = Math.max(
    0,
    modalBeli - buybackValue - vaBonusSummary.totalVaBonus
  );

  return {
    modalBeli,
    totalGram,
    voucherDiscount,
    vaBonusSummary,
    netModal,
    buybackValue,
    netProfit,
    roiPercentage,
    spreadPerGram,
    spreadPercentage,
    breakEvenVoucher,
    isProfitable: netProfit >= 0,
    isValid: true,
    validationMessage: null,
  };
}
