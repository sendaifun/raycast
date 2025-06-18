import { ActionPanel, Action, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function Transfer() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { to: string; amount: string }) {
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

      await executeAction("transfer", {
        to: values.to,
        amount: amount,
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `SOL transfer executed successfully`,
      });
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to execute SOL transfer",
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
          <Action.SubmitForm title="Transfer" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="to" title="To Address" placeholder="Enter wallet address" />
      <Form.TextField id="amount" title="Amount (in SOL)" placeholder="Enter amount to transfer" />
    </Form>
  );
}

export default withAccessToken(provider)(Transfer);
