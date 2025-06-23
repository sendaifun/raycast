import { ActionPanel, Action, List, showToast, Toast, Image } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import BuyToken from "./buy-token";

interface Token {
  address: string;
  decimals: number;
  liquidity: number;
  logoURI: string;
  name: string;
  symbol: string;
  volume24hUSD: number;
  volume24hChangePercent: number;
  fdv: number;
  marketcap: number;
  rank: number;
  price: number;
  price24hChangePercent: number;
}

function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9)?.toFixed(2) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6)?.toFixed(2) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3)?.toFixed(2) + "K";
  }
  return num?.toFixed(2) ?? "0";
}

function formatPrice(price: number): string {
  return price < 0.01 ? price.toFixed(8) : price.toFixed(4);
}

function getMarkDown(selectedToken: Token) {
  return `## ${selectedToken.name} (${selectedToken.symbol})

 \`${selectedToken.address}\`

![${selectedToken.name}](${selectedToken.logoURI})`;
}

const TokenDetailMetadata = ({ token }: { token: Token }) => {
  return (
    <List.Item.Detail.Metadata>
      <List.Item.Detail.Metadata.Label title="Rank" text={`#${token.rank}`} />
      <List.Item.Detail.Metadata.Label title="Address" text={token.address} />
      <List.Item.Detail.Metadata.Label title="Symbol" text={token.symbol} />
      <List.Item.Detail.Metadata.Separator />
      <List.Item.Detail.Metadata.Label title="Price" text={`$${formatPrice(token.price)}`} />
      <List.Item.Detail.Metadata.Separator />
      <List.Item.Detail.Metadata.Label title="Market Cap" text={`$${formatNumber(token.marketcap)}`} />
      <List.Item.Detail.Metadata.Label title="FDV" text={`$${formatNumber(token.fdv)}`} />
      <List.Item.Detail.Metadata.Label title="Liquidity" text={`$${formatNumber(token.liquidity)}`} />
      <List.Item.Detail.Metadata.Separator />
      <List.Item.Detail.Metadata.Label title="24h Volume" text={`$${formatNumber(token.volume24hUSD)}`} />
      <List.Item.Detail.Metadata.Label
        title="Volume Change"
        text={`${token.volume24hChangePercent > 0 ? "+" : ""}${token.volume24hChangePercent?.toFixed(2)}%`}
      />
      <List.Item.Detail.Metadata.Label
        title="Price Change"
        text={`${token.price24hChangePercent > 0 ? "+" : ""}${token.price24hChangePercent?.toFixed(2)}%`}
      />
      <List.Item.Detail.Metadata.Separator />
      <List.Item.Detail.Metadata.Label title="Decimals" text={`${token.decimals}`} />
    </List.Item.Detail.Metadata>
  );
};

const GetTrendingTokens = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [buyingToken, setBuyingToken] = useState<Token | null>(null);

  useEffect(() => {
    loadTrendingTokens();
  }, []);

  async function loadTrendingTokens() {
    try {
      setIsLoading(true);
      const result = await executeAction("getTrendingTokens");
      setTokens(result.data as Token[]);
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load trending tokens",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (buyingToken) {
    return <BuyToken arguments={{ outputMint: buyingToken.address, inputAmount: "1" }} />;
  }

  return (
    <List isLoading={isLoading} isShowingDetail>
      {tokens.map((token) => (
        <List.Item
          key={token.address}
          title={token.name}
          detail={<List.Item.Detail metadata={<TokenDetailMetadata token={token} />} markdown={getMarkDown(token)} />}
          accessories={[{ text: `#${token.rank}` }]}
          icon={{ source: token.logoURI, mask: Image.Mask.RoundedRectangle }}
          actions={
            <ActionPanel>
              <Action title="Buy" onAction={() => setBuyingToken(token)} />
              <Action title="Refresh" onAction={loadTrendingTokens} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export default withAccessToken(provider)(GetTrendingTokens);
