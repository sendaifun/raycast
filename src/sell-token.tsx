import { ActionPanel, Action, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function SellToken() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { inputMint: string; outputAmount: string }) {
    try {
      setIsLoading(true);
      const outputAmount = parseFloat(values.outputAmount);

      if (isNaN(outputAmount) || outputAmount <= 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid amount",
          message: "Please enter a valid amount greater than 0",
        });
        return;
      }

      if (!values.inputMint || values.inputMint.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid token address",
          message: "Please enter a valid token mint address",
        });
        return;
      }

      await executeAction("sell", {
        inputMint: values.inputMint,
        outputAmount: outputAmount,
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `Token sale executed successfully`,
      });
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to execute token sale",
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
          <Action.SubmitForm title="Sell" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="inputMint" title="Token Address" placeholder="Enter token CA" />
      <Form.TextField id="outputAmount" title="Amount (in SOL)" placeholder="Enter amount to receive" />
    </Form>
  );
}

export default withAccessToken(provider)(SellToken);
