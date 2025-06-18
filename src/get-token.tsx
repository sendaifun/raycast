import { ActionPanel, Action, Form, showToast, Toast, List } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function GetToken() {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<string>("");
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

      const result = await executeAction("getToken", {
        tokenAddress: values.tokenAddress,
      });

      setTokenInfo(String(result));
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to get token information",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List isLoading={isLoading}>
      <List.Item
        title="Get Token Information"
        subtitle="Enter token address to get details"
        actions={
          <ActionPanel>
            <Action.Push
              title="Enter Token Address"
              target={
                <Form
                  actions={
                    <ActionPanel>
                      <Action.SubmitForm title="Get Token Info" onSubmit={handleSubmit} />
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
      {tokenInfo && <List.Item title="Token Information" subtitle={tokenInfo} accessories={[{ text: tokenAddress }]} />}
    </List>
  );
}

export default withAccessToken(provider)(GetToken);
