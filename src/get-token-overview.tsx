import { ActionPanel, Action, showToast, Toast, Detail, LaunchProps } from "@raycast/api";
import { useEffect, useState } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import { isValidSolanaAddress } from "./utils/is-valid-address";
import BuyTokenForm from "./views/buy-token-form";

interface TokenInfo {
  name: string;
  decimals: number;
  symbol: string;
  address: string | number;
  marketCap: number;
  fdv: number;
  price: number;
  holder: number;
  website?: string;
  twitter?: string;
  image?: string;
  liquidity: number;
  priceChange: {
    "1 minute": number;
    "1 hour": number;
    "6 hours": number;
    "30 minutes": number;
    "12 hours": number;
    "24 hours": number;
  };
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

function getMarkdown(tokenInfo: TokenInfo): string {
  const priceChangeEntries = Object.entries(tokenInfo.priceChange);
  const priceChangeMarkdown = priceChangeEntries
    .map(([timeframe, change]) => `**${timeframe}:** ${change > 0 ? "+" : ""}${change.toFixed(2)}%`)
    .join("\n");

  return `# ${tokenInfo.name} (${tokenInfo.symbol})

## Token Details


**Symbol:** ${tokenInfo.symbol}

**Decimals:** ${tokenInfo.decimals}

**Price:** $${formatPrice(tokenInfo.price)}

**Market Cap:** $${formatNumber(tokenInfo.marketCap)}

**FDV:** $${formatNumber(tokenInfo.fdv)}

**Liquidity:** $${formatNumber(tokenInfo.liquidity)}

**Holders:** ${tokenInfo.holder.toLocaleString()}

## Price Changes

${priceChangeMarkdown}

## Links

${tokenInfo.website ? `**Website:** [${tokenInfo.website}](${tokenInfo.website})` : ""}

${tokenInfo.twitter ? `**Twitter:** [${tokenInfo.twitter}](${tokenInfo.twitter})` : ""}

${tokenInfo.image ? `### Logo:\n\n![${tokenInfo.name}](${tokenInfo.image})` : ""}`;
}

function GetTokenOverview(props: LaunchProps<{ arguments: { tokenAddress: string } }>) {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");

  useEffect(() => {
    if (props.arguments.tokenAddress) {
      setTokenAddress(props.arguments.tokenAddress);
      handleSubmit({ tokenAddress: props.arguments.tokenAddress });
    }
  }, [props.arguments.tokenAddress]);

  async function handleSubmit(values: { tokenAddress: string }) {
    try {
      setIsLoading(true);
      setTokenAddress(values.tokenAddress);

      if (!values.tokenAddress || values.tokenAddress.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid token address",
          message: "Please enter a valid token address",
        });
        return;
      }

      if (isValidSolanaAddress(values.tokenAddress)) {
        const result = await executeAction("getToken", {
          tokenId: values.tokenAddress,
        });
        setTokenInfo(result.data as TokenInfo);
      } else {
        const { data } = await executeAction("getTokenDataByTicker", {
          ticker: values.tokenAddress,
        });
        const { data: tokenInfo } = (await executeAction("getToken", {
          tokenId: (data as { address: string }).address,
        })) as { data: TokenInfo };
        setTokenInfo(tokenInfo);
      }
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to get token information",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <Detail markdown="Loading..." isLoading={isLoading} />;
  }

  if (!tokenInfo) {
    return (
      <Detail
        markdown="### Token Overview\n\nEnter a token address or ticker symbol as an argument to view token information."
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={() => tokenAddress && handleSubmit({ tokenAddress })} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Detail
      isLoading={isLoading}
      markdown={getMarkdown(tokenInfo)}
      actions={
        <ActionPanel>
          <Action.Push title="Buy" target={<BuyTokenForm arguments={{ outputMint: tokenAddress }} />} />
          <Action title="Refresh" onAction={() => handleSubmit({ tokenAddress })} />
        </ActionPanel>
      }
    />
  );
}

export default withAccessToken(provider)(GetTokenOverview);
