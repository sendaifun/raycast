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
