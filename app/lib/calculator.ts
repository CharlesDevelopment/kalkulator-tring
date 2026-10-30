export type InputMode = "rupiah" | "gram";

export type PaymentMethodType = "VA_BCA" | "VA_DIGITAL";

export interface PaymentTransactionRow {
  id: string;
  method: PaymentMethodType;
  label?: string;
  frequency: number;
}

export interface TringCalculationInput {
  inputMode: InputMode;
  nominalInput: number;
  gramInput: number;
  voucherDiscount: number;
  voucherCoversServiceFee?: boolean;
  buyPricePerGram: number;
  buybackPricePerGram: number;
  paymentRows: PaymentTransactionRow[];
}

export interface PaymentBonusSummary {
  totalTransactions: number;
  bcaCount: number;
  digitalBankCount: number;
  initialServiceFee: number;
  totalVaBonus: number;
  netServiceEffect: number;
  formulaText: string;
}

export interface TringCalculationResult {
  modalBeliPerTx: number;
  voucherDiscountPerTx: number;
  modalBeli: number;
  totalGram: number;
  voucherDiscount: number;
  voucherCoversServiceFee: boolean;
  voucherGoldPortion: number;
  voucherFeePortion: number;
  tagihanAwalVa: number;
  vaBonusSummary: PaymentBonusSummary;
  netModal: number;
  buybackValue: number;
  netProfit: number;
  netProfitPerTx: number;
  roiPercentage: number;
  spreadPerGram: number;
  spreadPercentage: number;
  breakEvenVoucher: number;
  isProfitable: boolean;
  isValid: boolean;
  validationMessage: string | null;
}

export const VA_SERVICE_FEE_PER_TX = 2500;

export const VA_BONUS_RATES: Record<PaymentMethodType, number> = {
  VA_BCA: 0,
  VA_DIGITAL: 2500,
};

export function calculatePaymentVaBonus(
  rows: PaymentTransactionRow[],
  voucherCoversServiceFee = true
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

  const totalTransactions = bcaCount + digitalBankCount;
  const initialServiceFee = totalTransactions * VA_SERVICE_FEE_PER_TX;
  const totalVaBonus = digitalBankCount * VA_BONUS_RATES.VA_DIGITAL;

  const netServiceEffect = voucherCoversServiceFee
    ? totalVaBonus
    : totalVaBonus - initialServiceFee;

  const parts: string[] = [];
  if (digitalBankCount > 0) {
    parts.push(`${digitalBankCount}x Bank Digital (Hemat Rp2.500/tx)`);
  }
  if (bcaCount > 0 || digitalBankCount === 0) {
    parts.push(`${bcaCount}x Bank Konvensional (Tetap Rp0)`);
  }

  const formulaText = parts.join(" + ");

  return {
    totalTransactions,
    bcaCount,
    digitalBankCount,
    initialServiceFee,
    totalVaBonus,
    netServiceEffect,
    formulaText,
  };
}

export function roundGoldGram(gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return Math.round((gram + Number.EPSILON) * 10000) / 10000;
}

export function calculateTringCuan(
  input: TringCalculationInput
): TringCalculationResult {
  const voucherCoversServiceFee = input.voucherCoversServiceFee ?? true;
  const vaBonusSummary = calculatePaymentVaBonus(
    input.paymentRows,
    voucherCoversServiceFee
  );

  const buyPrice = Number.isFinite(input.buyPricePerGram)
    ? input.buyPricePerGram
    : 0;
  const buybackPrice = Number.isFinite(input.buybackPricePerGram)
    ? input.buybackPricePerGram
    : 0;

  if (buyPrice <= 0 || buybackPrice <= 0) {
    return {
      modalBeliPerTx: 0,
      voucherDiscountPerTx: 0,
      modalBeli: 0,
      totalGram: 0,
      voucherDiscount: 0,
      voucherCoversServiceFee,
      voucherGoldPortion: 0,
      voucherFeePortion: 0,
      tagihanAwalVa: 0,
      vaBonusSummary,
      netModal: 0,
      buybackValue: 0,
      netProfit: 0,
      netProfitPerTx: 0,
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

  const rawModalPerTx =
    input.inputMode === "rupiah"
      ? Math.max(0, input.nominalInput)
      : Math.max(0, input.gramInput) * buyPrice;

  const modalBeliPerTx = Math.round(rawModalPerTx);
  const rawGramPerTx =
    input.inputMode === "gram"
      ? Math.max(0, input.gramInput)
      : buyPrice > 0
      ? modalBeliPerTx / buyPrice
      : 0;

  // Pegadaian Tring! membukukan saldo emas dengan presisi 4 desimal (0,0001 gram)
  const gramPerTx = roundGoldGram(rawGramPerTx);

  const maxVoucherPerTx = modalBeliPerTx + VA_SERVICE_FEE_PER_TX;
  const voucherDiscountPerTx = Math.max(
    0,
    Math.min(maxVoucherPerTx, Math.round(input.voucherDiscount))
  );

  const txCount = vaBonusSummary.totalTransactions;

  if (modalBeliPerTx <= 0 || gramPerTx <= 0 || txCount <= 0) {
    return {
      modalBeliPerTx,
      voucherDiscountPerTx,
      modalBeli: 0,
      totalGram: 0,
      voucherDiscount: 0,
      voucherCoversServiceFee,
      voucherGoldPortion: 0,
      voucherFeePortion: 0,
      tagihanAwalVa: 0,
      vaBonusSummary,
      netModal: 0,
      buybackValue: 0,
      netProfit: 0,
      netProfitPerTx: 0,
      roiPercentage: 0,
      spreadPerGram: buyPrice - buybackPrice,
      spreadPercentage: ((buyPrice - buybackPrice) / buyPrice) * 100,
      breakEvenVoucher: 0,
      isProfitable: false,
      isValid: false,
      validationMessage:
        txCount <= 0
          ? "Masukkan minimal 1x Jumlah Transaksi pada metode pembayaran VA di bawah."
          : "Masukkan nominal pembelian Rupiah atau berat gram emas di atas 0 untuk melihat hasil audit cuan.",
    };
  }

  // Kalikan seluruh komponen per 1x transaksi dengan total frekuensi transaksi VA (txCount)
  const modalBeli = modalBeliPerTx * txCount;
  const totalGram = roundGoldGram(gramPerTx * txCount);
  const voucherDiscount = voucherDiscountPerTx * txCount;

  // Tagihan Awal VA = Total Modal Beli + Total Biaya Layanan VA Awal (2.500 x txCount) - Total Voucher
  const tagihanAwalVa = Math.max(
    0,
    modalBeli + vaBonusSummary.initialServiceFee - voucherDiscount
  );

  const voucherFeePortion = voucherCoversServiceFee
    ? Math.min(voucherDiscount, vaBonusSummary.initialServiceFee)
    : 0;
  const voucherGoldPortion = Math.max(0, voucherDiscount - voucherFeePortion);

  // Total Transfer Bersih (Net Modal) setelah dipotong gratis admin Bank Digital (2.500 x digitalBankCount)
  const netModal = Math.max(0, tagihanAwalVa - vaBonusSummary.totalVaBonus);

  // Nilai buyback dihitung per transaksi lalu dikalikan txCount agar konsisten dengan pembulatan per transaksi
  const buybackPerTx = Math.round(gramPerTx * buybackPrice);
  const buybackValue = buybackPerTx * txCount;

  const netProfit = buybackValue - netModal;
  const netProfitPerTx = Math.round(netProfit / txCount);
  const roiPercentage = netModal > 0 ? (netProfit / netModal) * 100 : 0;

  const spreadPerGram = buyPrice - buybackPrice;
  const spreadPercentage = (spreadPerGram / buyPrice) * 100;
  const breakEvenVoucher = Math.max(
    0,
    modalBeli +
      vaBonusSummary.initialServiceFee -
      vaBonusSummary.totalVaBonus -
      buybackValue
  );

  return {
    modalBeliPerTx,
    voucherDiscountPerTx,
    modalBeli,
    totalGram,
    voucherDiscount,
    voucherCoversServiceFee,
    voucherGoldPortion,
    voucherFeePortion,
    tagihanAwalVa,
    vaBonusSummary,
    netModal,
    buybackValue,
    netProfit,
    netProfitPerTx,
    roiPercentage,
    spreadPerGram,
    spreadPercentage,
    breakEvenVoucher,
    isProfitable: netProfit >= 0,
    isValid: true,
    validationMessage: null,
  };
}
