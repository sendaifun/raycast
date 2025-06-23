import { ActionPanel, Action, showToast, Toast, Detail, LaunchProps } from "@raycast/api";
import { useEffect, useState } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import { isValidSolanaAddress } from "./utils/is-valid-address";
import { getPriceHistory } from "./utils/getPriceHistory";

function formatPrice(price: number): string {
  return price < 0.01 ? price.toFixed(8) : price.toFixed(4);
}

function getMarkdown(price: number, tokenAddress: string, chartDataUrl?: string): string {
  return `## Token Price Chart

**Address:** \`${tokenAddress}\`

${chartDataUrl ? `![Chart](${chartDataUrl}?raycast-width=300&raycast-height=300)` : ""}`;
}

function FetchPrice(props: LaunchProps<{ arguments: { caOrTicker: string } }>) {
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [tokenAddressOrTicker, setTokenAddressOrTicker] = useState<string>("");
  const [chartDataUrl, setChartDataUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (props.arguments.caOrTicker) {
      setTokenAddressOrTicker(props.arguments.caOrTicker);
      handleSubmit({ tokenAddressOrTicker: props.arguments.caOrTicker });
    }
  }, [props.arguments.caOrTicker]);

  async function handleSubmit(values: { tokenAddressOrTicker: string }) {
    try {
      setIsLoading(true);
      setTokenAddressOrTicker(values.tokenAddressOrTicker);

      if (!values.tokenAddressOrTicker || values.tokenAddressOrTicker.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid token address",
          message: "Please enter a valid token address or ticker",
        });
        return;
      }

      if (!isValidSolanaAddress(values.tokenAddressOrTicker)) {
        const tokenData = (await executeAction("getTokenDataByTicker", {
          ticker: values.tokenAddressOrTicker,
        })) as { data: { address: string } };

        const tokenAddr = tokenData.data.address;

        const result = (await executeAction("fetchPrice", {
          tokenId: tokenAddr,
        })) as { data: number };

        setTokenAddressOrTicker(tokenAddr);
        const chart = await getPriceHistory({
          address: tokenAddr,
          timeFrom: Math.floor(new Date(Date.now() - 1000 * 60 * 60 * 24).getTime() / 1000),
          timeTo: Math.floor(new Date().getTime() / 1000),
          timeInterval: "1H",
        });
        setChartDataUrl(chart.data?.chartImageUrl);
        setPrice(Number(result.data));
      } else {
        const result = await executeAction("fetchPrice", {
          tokenId: values.tokenAddressOrTicker,
        });

        setPrice(Number(result.data));
      }
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to fetch token price",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <Detail markdown="Loading..." isLoading={isLoading} />;
  }

  if (!price) {
    return (
      <Detail
        markdown="### Error fetching price: Enter correct token address or ticker as an argument to fetch the current price."
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={() => handleSubmit({ tokenAddressOrTicker: tokenAddressOrTicker })} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Detail
      isLoading={isLoading}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Price" text={`$${formatPrice(price)}`} />
          <Detail.Metadata.Label title="Token" text={tokenAddressOrTicker} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Last updated" text={new Date().toLocaleString()} />
        </Detail.Metadata>
      }
      markdown={getMarkdown(price, tokenAddressOrTicker, chartDataUrl)}
      actions={
        <ActionPanel>
          <Action title="Refresh" onAction={() => handleSubmit({ tokenAddressOrTicker: tokenAddressOrTicker })} />
        </ActionPanel>
      }
    />
  );
}

export default withAccessToken(provider)(FetchPrice);
