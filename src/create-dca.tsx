import { ActionPanel, Action, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { executeAction, ApiParams } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken, useForm } from "@raycast/utils";
import { isValidSolanaAddress } from "./utils/is-valid-address";
import { DCARequest } from "./type";
import { OwnedTokensDropdown } from "./components/OwnedTokensDropdown";
import { SOL, WRAPPED_SOL_ADDRESS } from "./constants/tokenAddress";

function CreateDCA() {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { handleSubmit, itemProps, reset } = useForm<DCARequest>({
    async onSubmit(values) {
      await handleCreateDCA(values);
    },
    validation: {
      inputMint: (value) => {
        if (!value || value.trim() === "") {
          return "Please enter a valid input token address";
        }
      },
      outputMint: (value) => {
        if (!value || value.trim() === "") {
          return "Please enter a valid output token address";
        }
        if (!isValidSolanaAddress(value)) {
          return "Please enter a valid output token address";
        }
      },
      inAmount: (value) => {
        if (!value || value.trim() === "") {
          return "Please enter an amount";
        }
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
          return "Please enter a valid amount greater than 0";
        }
      },
      numberOfOrders: (value) => {
        if (!value || value.trim() === "") {
          return "Please enter number of orders";
        }
        const orders = parseInt(value);
        if (isNaN(orders) || orders <= 1) {
          return "Number of orders cannot be lower than 2";
        }
      },
      interval: (value) => {
        if (!value || value.trim() === "") {
          return "Please enter an interval";
        }
        const intervalVal = parseInt(value);
        if (isNaN(intervalVal) || intervalVal <= 0) {
          return "Please enter a valid interval greater than 0";
        }
      },
    },
  });

  async function handleCreateDCA(values: DCARequest) {
    try {
      setIsLoading(true);

      const inputMint = values.inputMint === SOL.address ? WRAPPED_SOL_ADDRESS : values.inputMint;
      const outputMint = values.outputMint === SOL.address ? WRAPPED_SOL_ADDRESS : values.outputMint;

      const numberOfOrders = parseInt(values.numberOfOrders);
      const interval = parseInt(values.interval);

      const apiParams: ApiParams = {
        inputMint: inputMint,
        outputMint: outputMint,
        inputAmountAllocated: values.inAmount,
        everyTime: interval,
        everyUnit: "minute",
        overOrder: numberOfOrders,
      };

      const result = await executeAction("createDCA", apiParams, false);

      setTxHash(result.data?.toString() ?? null);

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `DCA strategy created successfully ${result.data?.toString()}`,
      });
      reset();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to create DCA strategy",
      });
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
      <OwnedTokensDropdown
        title="Selling"
        placeholder="Enter input token CA (e.g., SOL)"
        itemProps={itemProps.inputMint}
      />
      <Form.TextField {...itemProps.outputMint} title="Buying" placeholder="Enter output token CA" />
      <Form.TextField {...itemProps.inAmount} title="Allocate" placeholder="Enter amount to allocate" />
      <Form.TextField {...itemProps.numberOfOrders} title="Over" placeholder="Enter total number of orders" />
      <Form.TextField {...itemProps.interval} title="Every" placeholder="Enter interval between orders in minutes" />
      {/* {txHash && <Detail markdown={`[View on Solscan](https://solscan.io/tx/${txHash})`} />} */}
    </Form>
  );
}

export default withAccessToken(provider)(CreateDCA);
