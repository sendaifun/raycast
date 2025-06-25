import { ActionPanel, Action, List, showToast, Toast, Image } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import { PortfolioToken } from "./type";
import GetTokenOverview from "./get-token-overview";

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

function GetPortfolio() {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      setIsLoading(true);
      const result = await executeAction("getPortfolio", {}, true, 1000 * 60);
      const portfolioResult = result as { data: PortfolioData };
      setPortfolio(portfolioResult.data);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to load portfolio",
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
              icon={{ source: token.logoURI, mask: Image.Mask.Circle }}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="View Details"
                    target={<GetTokenOverview arguments={{ tokenAddress: token.address }} />}
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
