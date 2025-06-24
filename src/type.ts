export interface PriceHistoryItem {
  unixTime: number;
  value: number;
}
export interface PriceHistory {
  items: PriceHistoryItem[];
  chartImageUrl: string;
}

export interface PortfolioToken {
  address: string;
  decimals: number;
  balance: number;
  uiAmount: number;
  chainId: string;
  name: string;
  symbol: string;
  icon?: string;
  logoURI: string;
  priceUsd: number;
  valueUsd: number;
}

export interface DCAParams {
  inputMint: string;
  outMint: string;
  inAmount: number;
  numberOfOrders: number;
  interval: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  startAt?: number | null;
}

export interface LimitOrderParams {
  inputMint: string;
  outputMint: string;
  makingAmount: string;
  takingAmount: string;
  slippageBps?: number;
  expiredAt?: number;
  feeBps?: number;
}

export interface LimitOrder {
  id: string;
  maker: string;
  inputMint: string;
  outputMint: string;
  makingAmount: string;
  takingAmount: string;
  status: string;
  createdAt: number;
  expiredAt?: number | null;
  feeBps?: number | null;
  slippageBps?: number | null;
  filledMakingAmount?: string;
  filledTakingAmount?: string;
}

export interface RugcheckResult {
  status: string;
  data: {
    tokenProgram: string;
    tokenType: string;
    risks: string[];
    score: string;
    score_normalised: number;
  };
}

export interface BackendAuthResponse {
  token?: string;
  message?: string;
}
