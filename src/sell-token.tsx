import { ActionPanel, Action, Form, showToast, Toast, LaunchProps } from "@raycast/api";
import { useEffect, useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function SellToken(props: LaunchProps<{ arguments: { inputMint: string; inputAmount: string } }>) {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (props.arguments.inputMint && props.arguments.inputAmount) {
      handleSubmit({ inputMint: props.arguments.inputMint, inputAmount: props.arguments.inputAmount });
    }
  }, [props.arguments.inputMint, props.arguments.inputAmount]);

  async function handleSubmit(values: { inputMint: string; inputAmount: string }) {
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

      if (!values.inputMint || values.inputMint.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid token address",
          message: "Please enter a valid token mint address",
        });
        return;
      }

      const result = await executeAction("sell", {
        inputAmount: inputAmount,
        inputMint: values.inputMint,
      });

      setTxHash(result.data?.toString() ?? null);

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `Token sale executed successfully`,
      });
      return;
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to execute token sale",
      });
      return;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      searchBarAccessory={
        txHash ? <Form.LinkAccessory target={`https://solscan.io/tx/${txHash}`} text="View on Solscan" /> : null
      }
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Sell" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        defaultValue={props.arguments.inputMint}
        id="inputMint"
        title="Token Address"
        placeholder="Enter token CA"
      />
      <Form.TextField
        defaultValue={props.arguments.inputAmount}
        id="inputAmount"
        title="Amount"
        placeholder="Enter amount to sell"
      />
    </Form>
  );
}

export default withAccessToken(provider)(SellToken);
