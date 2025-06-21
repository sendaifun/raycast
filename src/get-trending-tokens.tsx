import { ActionPanel, Action, List, showToast, Toast, Detail } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

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
    return (num / 1e9).toFixed(2) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  }
  return num.toFixed(2);
}

function formatPrice(price: number): string {
  return price < 0.01 ? price.toFixed(8) : price.toFixed(4);
}

function getMarkDown(selectedToken: Token) {
  return `# ${selectedToken.name} (${selectedToken.symbol})

## Token Details

**Address:** \`${selectedToken.address}\`

**Rank:** #${selectedToken.rank}

**Price:** $${formatPrice(selectedToken.price)}

**Market Cap:** $${formatNumber(selectedToken.marketcap)}

**FDV:** $${formatNumber(selectedToken.fdv)}

**Liquidity:** $${formatNumber(selectedToken.liquidity)}

## 24h Statistics

**Volume:** $${formatNumber(selectedToken.volume24hUSD)}

**Volume Change:** ${selectedToken.volume24hChangePercent > 0 ? "+" : ""}${selectedToken.volume24hChangePercent.toFixed(2)}%

**Price Change:** ${selectedToken.price24hChangePercent > 0 ? "+" : ""}${selectedToken.price24hChangePercent.toFixed(2)}%

## Technical Info

**Decimals:** ${selectedToken.decimals}

### Logo:

![${selectedToken.name}](${selectedToken.logoURI})`;
}

function GetTrendingTokens() {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

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

  if (selectedToken) {
    return (
      <Detail
        markdown={getMarkDown(selectedToken)}
        actions={
          <ActionPanel>
            <Action title="Back to List" onAction={() => setSelectedToken(null)} />
            <Action title="Refresh" onAction={loadTrendingTokens} />
          </ActionPanel>
        }
      />
    );
  }
  return (
    <List isLoading={isLoading}>
      {tokens.map((token) => (
        <List.Item
          key={token.address}
          title={token.name}
          subtitle={`$${formatNumber(token.volume24hUSD)}`}
          accessories={[
            { text: `$${formatPrice(token.price)}` },
            { text: `${token.price24hChangePercent > 0 ? "+" : ""}${token.price24hChangePercent.toFixed(1)}%` },
            { text: `#${token.rank}` },
          ]}
          icon={token.logoURI}
          actions={
            <ActionPanel>
              <Action title="View Details" onAction={() => setSelectedToken(token)} />
              <Action title="Refresh" onAction={loadTrendingTokens} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export default withAccessToken(provider)(GetTrendingTokens);
