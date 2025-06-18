import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetTopLST() {
  const [isLoading, setIsLoading] = useState(true);
  const [lstData, setLstData] = useState<string>("");

  useEffect(() => {
    loadTopLST();
  }, []);

  async function loadTopLST() {
    try {
      setIsLoading(true);
      const result = await executeAction("getTopLst");
      setLstData(String(result));
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load top LST tokens",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Top LST Tokens"
        subtitle="Liquid staking tokens"
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={loadTopLST} />
          </ActionPanel>
        }
      />
      {lstData && <List.Item title="LST Data" subtitle={lstData} />}
    </List>
  );
}

export default withAccessToken(provider)(GetTopLST);
