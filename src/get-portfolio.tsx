import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetPortfolio() {
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<unknown>(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      setIsLoading(true);
      const result = await executeAction("getPortfolio");
      setPortfolio(result);
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
      <List.Item
        title="Portfolio"
        subtitle="Your token holdings"
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={loadPortfolio} />
          </ActionPanel>
        }
      />
      {portfolio && <List.Item title="Portfolio Data" subtitle={String(portfolio)} />}
    </List>
  );
}

export default withAccessToken(provider)(GetPortfolio);
