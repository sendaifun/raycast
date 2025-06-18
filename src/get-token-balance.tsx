import { ActionPanel, Action, Form, showToast, Toast, List } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetTokenBalance() {
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");

  async function handleSubmit(values: { tokenAddress: string }) {
    try {
      setIsLoading(true);
      setTokenAddress(values.tokenAddress);

      if (!values.tokenAddress || values.tokenAddress.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid token address",
          message: "Please enter a valid token address",
        });
        return;
      }

      const result = await executeAction("getTokenBalance", {
        mintAddress: values.tokenAddress,
      });

      setBalance(result.toString());
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to get token balance",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Get Token Balance"
        subtitle="Enter token address to check balance"
        actions={
          <ActionPanel>
            <Action.Push
              title="Enter Token Address"
              target={
                <Form
                  actions={
                    <ActionPanel>
                      <Action.SubmitForm title="Get Balance" onSubmit={handleSubmit} />
                    </ActionPanel>
                  }
                >
                  <Form.TextField id="tokenAddress" title="Token Address" placeholder="Enter token mint address" />
                </Form>
              }
            />
          </ActionPanel>
        }
      />
      {balance && (
        <List.Item title="Token Balance" subtitle={`${balance} tokens`} accessories={[{ text: tokenAddress }]} />
      )}
    </List>
  );
}

export default withAccessToken(provider)(GetTokenBalance);
