import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function Balance() {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    loadBalance();
  }, []);

  async function loadBalance() {
    try {
      setIsLoading(true);
      const result = await executeAction("getSolBalance");
      setBalance(result.toString());
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load balance",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Wallet Balance"
        subtitle={balance ? `${balance} SOL` : "Loading..."}
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={loadBalance} />
          </ActionPanel>
        }
      />
    </List>
  );
}

export default withAccessToken(provider)(Balance);
