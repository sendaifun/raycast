import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetTrendingTokens() {
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<unknown>(null);

  useEffect(() => {
    loadTrendingTokens();
  }, []);

  async function loadTrendingTokens() {
    try {
      setIsLoading(true);
      const result = await executeAction("getTrendingTokens");
      setTokens(result);
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

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Trending Tokens"
        subtitle="Popular tokens in the market"
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={loadTrendingTokens} />
          </ActionPanel>
        }
      />
      {tokens && <List.Item title="Trending Tokens Data" subtitle={String(tokens)} />}
    </List>
  );
}

export default withAccessToken(provider)(GetTrendingTokens);
