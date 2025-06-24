import { ActionPanel, Action, Form, showToast, Toast, LaunchProps, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import { isValidSolanaAddress } from "./utils/is-valid-address";

function CreateLimitOrder(
  props: LaunchProps<{ arguments: { inputMint: string; outputMint: string; makingAmount: string } }>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (props.arguments.inputMint && props.arguments.outputMint && props.arguments.makingAmount) {
      // Auto-submit if all required arguments are provided
      // Note: This would need additional form values, so we'll let user fill the form
    }
  }, [props.arguments.inputMint, props.arguments.outputMint, props.arguments.makingAmount]);

  async function handleSubmit(values: {
    inputMint: string;
    outputMint: string;
    makingAmount: string;
    takingAmount: string;
    slippageBps?: string;
    expiredAt?: Date;
    feeBps?: string;
  }) {
    try {
      setIsLoading(true);

      if (!values.makingAmount || values.makingAmount.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid making amount",
          message: "Please enter a valid making amount",
        });
        return;
      }

      if (!values.takingAmount || values.takingAmount.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid taking amount",
          message: "Please enter a valid taking amount",
        });
        return;
      }

      if (!isValidSolanaAddress(values.inputMint)) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid input token",
          message: "Please enter a valid input token address",
        });
        return;
      }

      if (!isValidSolanaAddress(values.outputMint)) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid output token",
          message: "Please enter a valid output token address",
        });
        return;
      }

      const apiParams: Record<string, string | number> = {
        inputMint: values.inputMint,
        outputMint: values.outputMint,
        makingAmount: values.makingAmount,
        takingAmount: values.takingAmount,
      };

      // Only add optional parameters if they have values
      if (values.slippageBps) {
        const slippageBps = parseInt(values.slippageBps);
        if (!isNaN(slippageBps)) {
          apiParams.slippageBps = slippageBps;
        }
      }
      if (values.expiredAt) {
        apiParams.expiredAt = Math.floor(values.expiredAt.getTime() / 1000);
      }
      if (values.feeBps) {
        const feeBps = parseInt(values.feeBps);
        if (!isNaN(feeBps)) {
          apiParams.feeBps = feeBps;
        }
      }

      const result = await executeAction("createLO", apiParams);

      setTxHash(result.data?.toString() ?? null);

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `Limit order created successfully ${result.data?.toString()}`,
      });
      return;
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to create limit order",
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
          <Action.SubmitForm title="Create Limit Order" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="inputMint"
        title="Input Token Address"
        placeholder="Enter input token CA"
        defaultValue={props.arguments.inputMint}
      />
      <Form.TextField
        id="outputMint"
        title="Output Token Address"
        placeholder="Enter output token CA"
        defaultValue={props.arguments.outputMint}
      />
      <Form.TextField
        id="makingAmount"
        title="Making Amount"
        placeholder="Enter amount you're providing"
        defaultValue={props.arguments.makingAmount}
      />
      <Form.TextField id="takingAmount" title="Taking Amount" placeholder="Enter amount you want to receive" />
      <Form.TextField id="slippageBps" title="Slippage BPS (Optional)" placeholder="Enter slippage in basis points" />
      <Form.DatePicker type={Form.DatePicker.Type.DateTime} id="expiredAt" title="Expires At (Optional)" />
      <Form.TextField id="feeBps" title="Fee BPS (Optional)" placeholder="Enter fee in basis points" />
      {txHash && <Detail markdown={`[View on Solscan](https://solscan.io/tx/${txHash})`} />}
    </Form>
  );
}

export default withAccessToken(provider)(CreateLimitOrder);
