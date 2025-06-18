import { ActionPanel, Action, Form, showToast, Toast, List } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function FetchPrice() {
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState<string>("");
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

      const result = await executeAction("fetchPrice", {
        tokenAddress: values.tokenAddress,
      });

      setPrice(String(result));
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to fetch token price",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <List isLoading={isLoading}>
        <List.Item title="Fetch Token Price" subtitle="Enter token address to get current price" />

        {price && <List.Item title="Token Price" subtitle={price} accessories={[{ text: tokenAddress }]} />}
      </List>
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm title="Fetch Price" onSubmit={handleSubmit} />
          </ActionPanel>
        }
      >
        <Form.TextField id="tokenAddress" title="Token Address" placeholder="Enter token address" />
      </Form>
    </>
  );
}

export default withAccessToken(provider)(FetchPrice);
