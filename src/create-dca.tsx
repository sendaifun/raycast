import { ActionPanel, Action, Form, showToast, Toast, LaunchProps, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import { isValidSolanaAddress } from "./utils/is-valid-address";

function CreateDCA(props: LaunchProps<{ arguments: { inputMint: string; outMint: string; inAmount: string } }>) {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (props.arguments.inputMint && props.arguments.outMint && props.arguments.inAmount) {
      // Auto-submit if all required arguments are provided
      // Note: This would need additional form values, so we'll let user fill the form
    }
  }, [props.arguments.inputMint, props.arguments.outMint, props.arguments.inAmount]);

  async function handleSubmit(values: {
    inputMint: string;
    outMint: string;
    inAmount: string;
    numberOfOrders: string;
    interval: string;
    minPrice?: string;
    maxPrice?: string;
    startAt?: string;
  }) {
    try {
      setIsLoading(true);

      const inAmount = parseFloat(values.inAmount);
      const numberOfOrders = parseInt(values.numberOfOrders);
      const interval = parseInt(values.interval);

      if (isNaN(inAmount) || inAmount <= 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid amount",
          message: "Please enter a valid amount greater than 0",
        });
        return;
      }

      if (isNaN(numberOfOrders) || numberOfOrders <= 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid number of orders",
          message: "Please enter a valid number of orders greater than 0",
        });
        return;
      }

      if (isNaN(interval) || interval <= 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid interval",
          message: "Please enter a valid interval greater than 0",
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

      if (!isValidSolanaAddress(values.outMint)) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid output token",
          message: "Please enter a valid output token address",
        });
        return;
      }

      const apiParams = {
        inputMint: values.inputMint,
        outMint: values.outMint,
        inAmount,
        numberOfOrders,
        interval,
      };

      // Only add optional parameters if they have values
      if (values.minPrice) {
        apiParams.minPrice = parseFloat(values.minPrice);
      }
      if (values.maxPrice) {
        apiParams.maxPrice = parseFloat(values.maxPrice);
      }
      if (values.startAt) {
        apiParams.startAt = parseInt(values.startAt);
      }

      const result = await executeAction("createDCA", apiParams);

      setTxHash(result.data?.toString() ?? null);

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `DCA strategy created successfully ${result.data?.toString()}`,
      });
      return;
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to create DCA strategy",
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
          <Action.SubmitForm title="Create DCA" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="inputMint"
        title="Input Token Address"
        placeholder="Enter input token CA (e.g., SOL)"
        defaultValue={props.arguments.inputMint}
      />
      <Form.TextField
        id="outMint"
        title="Output Token Address"
        placeholder="Enter output token CA"
        defaultValue={props.arguments.outMint}
      />
      <Form.TextField
        id="inAmount"
        title="Amount per Order"
        placeholder="Enter amount to spend per order"
        defaultValue={props.arguments.inAmount}
      />
      <Form.TextField id="numberOfOrders" title="Number of Orders" placeholder="Enter total number of orders" />
      <Form.TextField id="interval" title="Interval (seconds)" placeholder="Enter interval between orders in seconds" />
      <Form.TextField id="minPrice" title="Min Price (Optional)" placeholder="Enter minimum price threshold" />
      <Form.TextField id="maxPrice" title="Max Price (Optional)" placeholder="Enter maximum price threshold" />
      <Form.DatePicker
        onChange={(value) => {
          console.log(value);
        }}
        type={Form.DatePicker.Type.DateTime}
        id="startAt"
        title="Start At (Optional)"
      />
      {txHash && <Detail markdown={`[View on Solscan](https://solscan.io/tx/${txHash})`} />}
    </Form>
  );
}

export default withAccessToken(provider)(CreateDCA);
