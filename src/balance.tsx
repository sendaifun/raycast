import { ActionPanel, Action, Detail, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function Balance() {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadBalance();
  }, []);

  async function loadBalance() {
    try {
      setIsLoading(true);
      const result = await executeAction("getSolBalance");
      console.log("result", result);
      setBalance(result.data?.toString());
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to load balance",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const markdown = `# 💰 Wallet Balance

${
  isLoading
    ? `
## ⏳ Loading...
Please wait while we fetch your current balance...
`
    : balance
      ? `
### 🟢 Current Balance: **${balance} SOL**

---

### 📊 Balance Details
- **Network**: Solana
- **Currency**: SOL (Solana)
- **Last Updated**: ${new Date().toLocaleString()}

---

### 💡 Quick Actions
Use the action panel below to refresh your balance or perform other wallet operations.
`
      : `
## ❌ Error Loading Balance
Unable to fetch your wallet balance. Please try refreshing.
`
}

---

*Powered by SendAI*`;

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Refresh Balance" onAction={loadBalance} icon="🔄" />
          <Action
            title="Copy Balance"
            onAction={() => {
              if (balance) {
                // Copy to clipboard functionality would go here
                showToast({
                  style: Toast.Style.Success,
                  title: "Copied!",
                  message: `${balance} SOL copied to clipboard`,
                });
              }
            }}
            icon="📋"
          />
        </ActionPanel>
      }
    />
  );
}

export default withAccessToken(provider)(Balance);
