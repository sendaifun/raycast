export interface PriceHistoryItem {
  unixTime: number;
  value: number;
}
export interface PriceHistory {
  items: PriceHistoryItem[];
  chartImageUrl: string;
}
