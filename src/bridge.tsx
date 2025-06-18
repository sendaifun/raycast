import { ActionPanel, Action, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function Bridge() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { amount: string }) {
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

      await executeAction("bridge", {
        amount: amount,
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `Bridge transaction executed successfully`,
      });
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to execute bridge transaction",
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
          <Action.SubmitForm title="Bridge" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="amount" title="Amount" placeholder="Enter amount to bridge" />
    </Form>
  );
}

export default withAccessToken(provider)(Bridge);
