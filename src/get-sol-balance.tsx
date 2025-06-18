import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetSolBalance() {
  const [isLoading, setIsLoading] = useState(true);
  const [solBalance, setSolBalance] = useState<string>("");

  useEffect(() => {
    loadSolBalance();
  }, []);

  async function loadSolBalance() {
    try {
      setIsLoading(true);
      const result = await executeAction("getSolBalance");
      setSolBalance(result.toString());
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load SOL balance",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="SOL Balance"
        subtitle={solBalance ? `${solBalance} SOL` : "Loading..."}
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={loadSolBalance} />
          </ActionPanel>
        }
      />
    </List>
  );
}

export default withAccessToken(provider)(GetSolBalance);
