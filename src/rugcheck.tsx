import { ActionPanel, Action, Form, showToast, Toast, List } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function Rugcheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [rugcheckResult, setRugcheckResult] = useState<string>("");
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

      const result = await executeAction("rugcheck", {
        tokenAddress: values.tokenAddress,
      });

      setRugcheckResult(String(result));
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to perform rugcheck",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Rugcheck Token"
        subtitle="Check if a token is safe from rug pulls"
        actions={
          <ActionPanel>
            <Action.Push
              title="Enter Token Address"
              target={
                <Form
                  actions={
                    <ActionPanel>
                      <Action.SubmitForm title="Check Safety" onSubmit={handleSubmit} />
                    </ActionPanel>
                  }
                >
                  <Form.TextField id="tokenAddress" title="Token Address" placeholder="Enter token address" />
                </Form>
              }
            />
          </ActionPanel>
        }
      />
      {rugcheckResult && (
        <List.Item title="Rugcheck Result" subtitle={rugcheckResult} accessories={[{ text: tokenAddress }]} />
      )}
    </List>
  );
}

export default withAccessToken(provider)(Rugcheck);
