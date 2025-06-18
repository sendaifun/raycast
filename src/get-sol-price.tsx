import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetSolPrice() {
  const [isLoading, setIsLoading] = useState(true);
  const [solPrice, setSolPrice] = useState<string>("");

  useEffect(() => {
    loadSolPrice();
  }, []);

  async function loadSolPrice() {
    try {
      setIsLoading(true);
      const result = await executeAction("getSolPrice");
      setSolPrice(result.toString());
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load SOL price",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="SOL Price"
        subtitle={solPrice ? `$${solPrice}` : "Loading..."}
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={loadSolPrice} />
          </ActionPanel>
        }
      />
    </List>
  );
}

export default withAccessToken(provider)(GetSolPrice);
