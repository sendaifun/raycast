import { ActionPanel, Action, List, showToast, Toast, CopyToClipboardAction, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetWalletAddress() {
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    loadWalletAddress();
  }, []);

  async function loadWalletAddress() {
    try {
      setIsLoading(true);
      const result = await executeAction("getWalletAddress");
      setWalletAddress(result.data?.toString() || "");
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load wallet address",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Wallet Address"
        subtitle={walletAddress || "Loading..."}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard title="Copy Wallet Address" content={walletAddress} />
          </ActionPanel>
        }
        icon={Icon.CopyClipboard}
      />
    </List>
  );
}

export default withAccessToken(provider)(GetWalletAddress);
