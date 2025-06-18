import { ActionPanel, Action, Form, showToast, Toast, List } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetTokenDataByTicker() {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<string>("");
  const [ticker, setTicker] = useState<string>("");

  async function handleSubmit(values: { ticker: string }) {
    try {
      setIsLoading(true);
      setTicker(values.ticker);

      if (!values.ticker || values.ticker.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid ticker",
          message: "Please enter a valid ticker symbol",
        });
        return;
      }

      const result = await executeAction("getTokenDataByTicker", {
        ticker: values.ticker,
      });

      setTokenData(String(result));
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to get token data",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Get Token Data by Ticker"
        subtitle="Enter ticker symbol to get token data"
        actions={
          <ActionPanel>
            <Action.Push
              title="Enter Ticker"
              target={
                <Form
                  actions={
                    <ActionPanel>
                      <Action.SubmitForm title="Get Token Data" onSubmit={handleSubmit} />
                    </ActionPanel>
                  }
                >
                  <Form.TextField id="ticker" title="Ticker Symbol" placeholder="Enter ticker symbol" />
                </Form>
              }
            />
          </ActionPanel>
        }
      />
      {tokenData && <List.Item title="Token Data" subtitle={tokenData} accessories={[{ text: ticker }]} />}
    </List>
  );
}

export default withAccessToken(provider)(GetTokenDataByTicker);
