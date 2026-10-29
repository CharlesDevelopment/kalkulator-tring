export type InputMode = "rupiah" | "gram";

export type PaymentMethodType = "VA_BCA" | "VA_OTHER";

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

export interface PaymentFeeSummary {
  totalTransactions: number;
  bcaCount: number;
  otherBankCount: number;
  totalAdminFee: number;
  formulaText: string;
}

export interface TringCalculationResult {
  modalBeli: number;
  totalGram: number;
  voucherDiscount: number;
  adminFeeSummary: PaymentFeeSummary;
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

export const VA_FEE_RATES: Record<PaymentMethodType, number> = {
  VA_BCA: 0,
  VA_OTHER: 2500,
};

export function calculatePaymentAdminFees(
  rows: PaymentTransactionRow[]
): PaymentFeeSummary {
  let bcaCount = 0;
  let otherBankCount = 0;

  for (const row of rows) {
    const freq = Math.max(0, Math.floor(Number.isFinite(row.frequency) ? row.frequency : 0));
    if (row.method === "VA_BCA") {
      bcaCount += freq;
    } else {
      otherBankCount += freq;
    }
  }

  const totalAdminFee =
    bcaCount * VA_FEE_RATES.VA_BCA + otherBankCount * VA_FEE_RATES.VA_OTHER;
  const totalTransactions = bcaCount + otherBankCount;

  const parts: string[] = [];
  if (bcaCount > 0 || otherBankCount === 0) {
    parts.push(`(${bcaCount} x Rp0)`);
  }
  if (otherBankCount > 0) {
    parts.push(`(${otherBankCount} x Rp2.500)`);
  }

  const formulaText =
    parts.length > 0 ? parts.join(" + ") : "(0 x Rp0)";

  return {
    totalTransactions,
    bcaCount,
    otherBankCount,
    totalAdminFee,
    formulaText,
  };
}

export function calculateTringCuan(
  input: TringCalculationInput
): TringCalculationResult {
  const adminFeeSummary = calculatePaymentAdminFees(input.paymentRows);
  const buyPrice = Number.isFinite(input.buyPricePerGram) ? input.buyPricePerGram : 0;
  const buybackPrice = Number.isFinite(input.buybackPricePerGram)
    ? input.buybackPricePerGram
    : 0;

  if (buyPrice <= 0 || buybackPrice <= 0) {
    return {
      modalBeli: 0,
      totalGram: 0,
      voucherDiscount: 0,
      adminFeeSummary,
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
      adminFeeSummary,
      netModal: adminFeeSummary.totalAdminFee,
      buybackValue: 0,
      netProfit: -adminFeeSummary.totalAdminFee,
      roiPercentage: 0,
      spreadPerGram: buyPrice - buybackPrice,
      spreadPercentage: ((buyPrice - buybackPrice) / buyPrice) * 100,
      breakEvenVoucher: adminFeeSummary.totalAdminFee,
      isProfitable: false,
      isValid: false,
      validationMessage:
        "Masukkan nominal pembelian Rupiah atau berat gram emas di atas 0 untuk melihat hasil audit cuan.",
    };
  }

  const netModal = modalBeli - voucherDiscount + adminFeeSummary.totalAdminFee;
  const buybackValue = Math.round(totalGram * buybackPrice);
  const netProfit = buybackValue - netModal;
  const roiPercentage = netModal > 0 ? (netProfit / netModal) * 100 : 0;

  const spreadPerGram = buyPrice - buybackPrice;
  const spreadPercentage = (spreadPerGram / buyPrice) * 100;
  const breakEvenVoucher = Math.max(
    0,
    modalBeli - buybackValue + adminFeeSummary.totalAdminFee
  );

  return {
    modalBeli,
    totalGram,
    voucherDiscount,
    adminFeeSummary,
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
