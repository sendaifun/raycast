import { ActionPanel, Action, Detail, showToast, Toast, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./utils/api-wrapper";
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
        message: error instanceof Error ? error.message : "Failed to load wallet address",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const markdown = `# 🔑 Wallet Address

${
  isLoading
    ? `
## ⏳ Loading...
Please wait while we fetch your wallet address...
`
    : walletAddress
      ? `
### Your Wallet Address

####

\`\`\`
${walletAddress}
\`\`\`

####

### 💡 Quick Actions
Use the action panel below to copy your wallet address.
`
      : `
## ❌ Error Loading Address
Unable to fetch your wallet address. Please try refreshing.
`
}

---

*Powered by SendAI*`;

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      navigationTitle="Wallet Address"
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Wallet Address" content={walletAddress} icon={Icon.CopyClipboard} />
        </ActionPanel>
      }
    />
  );
}

export default withAccessToken(provider)(GetWalletAddress);
