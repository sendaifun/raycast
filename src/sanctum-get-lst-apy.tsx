import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function SanctumGetLSTAPY() {
  const [isLoading, setIsLoading] = useState(true);
  const [apyData, setApyData] = useState<string>("");

  useEffect(() => {
    loadAPY();
  }, []);

  async function loadAPY() {
    try {
      setIsLoading(true);
      const result = await executeAction("sanctumGetLstApy");
      setApyData(String(result));
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load Sanctum LST APY",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Sanctum LST APY"
        subtitle="APY information for Sanctum LST"
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={loadAPY} />
          </ActionPanel>
        }
      />
      {apyData && <List.Item title="APY Data" subtitle={apyData} />}
    </List>
  );
}

export default withAccessToken(provider)(SanctumGetLSTAPY);
