import { ActionPanel, Action, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function TransferSPL() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { to: string; mintAddress: string; amount: string }) {
    try {
      setIsLoading(true);
      const amount = parseFloat(values.amount);

      if (isNaN(amount) || amount <= 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid amount",
          message: "Please enter a valid amount greater than 0",
        });
        return;
      }

      if (!values.to || values.to.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid address",
          message: "Please enter a valid wallet address",
        });
        return;
      }

      if (!values.mintAddress || values.mintAddress.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid token address",
          message: "Please enter a valid token mint address",
        });
        return;
      }

      await executeAction("transferSpl", {
        to: values.to,
        mintAddress: values.mintAddress,
        amount: amount,
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `SPL token transfer executed successfully`,
      });
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to execute SPL token transfer",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Transfer SPL" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="to" title="To Address" placeholder="Enter wallet address" />
      <Form.TextField id="mintAddress" title="Token Mint Address" placeholder="Enter token mint address" />
      <Form.TextField id="amount" title="Amount" placeholder="Enter amount to transfer" />
    </Form>
  );
}

export default withAccessToken(provider)(TransferSPL);
