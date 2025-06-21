import { ActionPanel, Action, List, showToast, Toast, Detail } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

interface PortfolioToken {
  address: string;
  decimals: number;
  balance: number;
  uiAmount: number;
  chainId: string;
  name: string;
  symbol: string;
  icon?: string;
  logoURI?: string;
  priceUsd: number;
  valueUsd: number;
}

interface PortfolioData {
  wallet: string;
  totalUsd: number;
  items: PortfolioToken[];
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

function getTokenDetailMarkdown(token: PortfolioToken): string {
  return `# ${token.name} (${token.symbol})

## Token Details

**Address:** \`${token.address}\`

**Symbol:** ${token.symbol}

**Name:** ${token.name}

**Decimals:** ${token.decimals}

**Chain:** ${token.chainId}

## Holdings

**Balance:** ${token.uiAmount.toFixed(6)} ${token.symbol}

**Raw Balance:** ${token.balance.toLocaleString()}

**Price:** $${formatPrice(token.priceUsd)}

**Value:** $${formatNumber(token.valueUsd)}

${token.logoURI ? `### Logo: ![${token.name}](${token.logoURI})` : ""}`;
}

function GetPortfolio() {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      setIsLoading(true);
      const result = await executeAction("getPortfolio");
      const portfolioResult = result as { data: PortfolioData };
      setPortfolio(portfolioResult.data);
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load portfolio",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      {portfolio && (
        <>
          <List.Item
            title="Portfolio Overview"
            subtitle={`Total Value: $${formatNumber(portfolio.totalUsd)}`}
            accessories={[{ text: `${portfolio.items.length} tokens` }]}
            actions={
              <ActionPanel>
                <Action title="Refresh" onAction={loadPortfolio} />
              </ActionPanel>
            }
          />
          {portfolio.items.map((token) => (
            <List.Item
              key={token.address}
              title={token.symbol}
              subtitle={token.name}
              accessories={[
                { text: `${token.uiAmount.toFixed(4)} ${token.symbol}` },
                { text: `$${formatNumber(token.valueUsd)}` },
              ]}
              icon={token.logoURI}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="View Details"
                    target={
                      <Detail
                        markdown={getTokenDetailMarkdown(token)}
                        actions={
                          <ActionPanel>
                            <Action title="Back to Portfolio" onAction={() => {}} />
                            <Action title="Refresh" onAction={loadPortfolio} />
                          </ActionPanel>
                        }
                      />
                    }
                  />
                  <Action title="Refresh" onAction={loadPortfolio} />
                </ActionPanel>
              }
            />
          ))}
        </>
      )}
    </List>
  );
}

export default withAccessToken(provider)(GetPortfolio);
