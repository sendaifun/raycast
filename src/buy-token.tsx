import { ActionPanel, Action, Form, showToast, Toast, LaunchProps } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function BuyToken(props: LaunchProps<{ arguments: { outputMint: string; inputAmount: string } }>) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { outputMint: string; inputAmount: string }) {
    try {
      setIsLoading(true);
      const inputAmount = parseFloat(values.inputAmount);

      if (isNaN(inputAmount) || inputAmount <= 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid amount",
          message: "Please enter a valid amount greater than 0",
        });
        return;
      }
      const result = await executeAction("buy", {
        outputMint: values.outputMint,
        inputAmount: inputAmount,
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `Token purchase executed successfully ${result.data?.toString()}`,
      });
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to execute token purchase",
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
          <Action.SubmitForm title="Buy" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="outputMint"
        title="Token Address"
        placeholder="Enter token CA"
        defaultValue={props.arguments.outputMint}
      />
      <Form.TextField
        id="inputAmount"
        title="Amount (in SOL)"
        placeholder="Enter amount to spend"
        defaultValue={props.arguments.inputAmount}
      />
    </Form>
  );
}

export default withAccessToken(provider)(BuyToken);
