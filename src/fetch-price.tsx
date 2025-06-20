import { ActionPanel, Action, showToast, Toast, Detail, LaunchProps } from "@raycast/api";
import { useEffect, useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import { isTokenAddress } from "./utils/isCA";

function formatPrice(price: number): string {
  return price < 0.01 ? price.toFixed(8) : price.toFixed(4);
}

function getMarkdown(price: number, tokenAddress: string): string {
  return `# Token Price

**Current Price:** $${formatPrice(price)}

**Token:** \`${tokenAddress}\`

---

*Last updated: ${new Date().toLocaleString()}*`;
}

function FetchPrice(props: LaunchProps<{ arguments: { caOrTicker: string } }>) {
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [tokenAddressOrTicker, setTokenAddressOrTicker] = useState<string>("");

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

      console.log("values", values);

      if (!values.tokenAddressOrTicker || values.tokenAddressOrTicker.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid token address",
          message: "Please enter a valid token address or ticker",
        });
        return;
      }

      if (!isTokenAddress(values.tokenAddressOrTicker)) {
        const tokenData = (await executeAction("getTokenDataByTicker", {
          ticker: values.tokenAddressOrTicker,
        })) as { data: { address: string } };
        const tokenAddr = tokenData.data.address;
        const result = (await executeAction("fetchPrice", {
          tokenId: tokenAddr,
        })) as { data: number };
        setPrice(Number(result.data));
      } else {
        const result = await executeAction("fetchPrice", {
          tokenId: values.tokenAddressOrTicker,
        });
        setPrice(Number(result.data));
      }
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to fetch token price",
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
        markdown="### error fetching price enter correct token address or ticker as an argument to fetch the current price."
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
      markdown={getMarkdown(price, tokenAddressOrTicker)}
      actions={
        <ActionPanel>
          <Action title="Refresh" onAction={() => handleSubmit({ tokenAddressOrTicker: tokenAddressOrTicker })} />
        </ActionPanel>
      }
    />
  );
}

export default withAccessToken(provider)(FetchPrice);
