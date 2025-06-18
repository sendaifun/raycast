import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function LuloGetAPY() {
  const [isLoading, setIsLoading] = useState(true);
  const [apyData, setApyData] = useState<string>("");

  useEffect(() => {
    loadAPY();
  }, []);

  async function loadAPY() {
    try {
      setIsLoading(true);
      const result = await executeAction("luloGetApy");
      setApyData(String(result));
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load Lulo APY",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Lulo APY"
        subtitle="APY information from Lulo"
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

export default withAccessToken(provider)(LuloGetAPY);
