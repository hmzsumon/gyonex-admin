/* ────────── admin lucky card shared types ────────── */

export type LuckyPackageRow = {
  _id: string;
  name: string;
  cardCount: number;
  bonusCards: number;
  regularPrice: number;
  price: number;
  isActive: boolean;
  sortOrder: number;
};

export type LuckyPrizeTierRow = {
  _id: string;
  label: string;
  symbol: string;
  amount: number;
  weight: number;
  stockLimit: number | null;
  stockUsed: number;
  isJackpot: boolean;
  sortOrder: number;
};

export type LuckyCardTypeRow = {
  _id: string;
  key: string;
  name: string;
  price: number;
  accent: string;
  targetRtp: number;
  displayTopPrize: number;
  realTopPrize: number;
  theoreticalRtp: number;
  isActive: boolean;
  sortOrder: number;
  cardsIssued: number;
  prizeTiers: LuckyPrizeTierRow[];
  packages: LuckyPackageRow[];
};

export type LuckyPrizePoolRow = {
  _id: string;
  code: string;
  label: string;
  symbol: string;
  amount: number;
  percent: number;
  balance: number;
  fillPercent: number;
  timesWon: number;
  totalPaid: number;
  totalContributed: number;
  lastWonAt: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type LuckyPoolConfigSummary = {
  companyFundPercent: number;
  companyFundCollected: number;
  totalContributed: number;
  totalPaidOut: number;
  lastConfirmedAt: string | null;
};

export type LuckyPoolTotals = {
  prizePercentSum: number;
  grandTotalPercent: number;
  over100: boolean;
  exactly100: boolean;
  under100: boolean;
  valid: boolean;
  configuredPayoutPercent: number;
  actualRtp: number;
};

export type LuckyRtpRow = {
  _id: string;
  name: string;
  price: number;
  targetRtp: number;
  theoreticalRtp: number;
  cardsOpened: number;
  staked: number;
  paidOut: number;
  actualRtp: number;
  houseProfit: number;
  statsSince: string | null;
};

export type LuckyRecentWin = {
  _id: string;
  shortCode: string;
  user: string;
  customerId: string;
  cardType: string;
  prizeCode: string;
  prizeLabel: string;
  prizeAmount: number;
  source: "purchase" | "gift";
  openedAt: string;
};

export type LuckyRecentPurchase = {
  _id: string;
  user: string;
  customerId: string;
  cardType: string;
  quantity: number;
  totalPrice: number;
  source: "purchase" | "gift";
  createdAt: string;
};

export type LuckyGiftRow = {
  _id: string;
  user: { _id: string; name: string; customerId: string } | null;
  giftedBy: { _id: string; name: string; customerId: string } | null;
  cardType: string;
  quantity: number;
  prizeAmount: number;
  note: string;
  createdAt: string;
};
