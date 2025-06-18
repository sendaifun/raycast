import { ActionPanel, Action, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { executeAction } from "./shared/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

function LaunchPumpFunToken() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
    amount: string;
    twitter?: string;
    telegram?: string;
    website?: string;
  }) {
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

      if (!values.name || values.name.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid name",
          message: "Please enter a valid token name",
        });
        return;
      }

      if (!values.symbol || values.symbol.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid symbol",
          message: "Please enter a valid token symbol",
        });
        return;
      }

      const params: Record<string, string | number> = {
        name: values.name,
        symbol: values.symbol,
        description: values.description || "",
        imageUrl: values.imageUrl || "",
        amount: amount,
      };

      if (values.twitter) params.twitter = values.twitter;
      if (values.telegram) params.telegram = values.telegram;
      if (values.website) params.website = values.website;

      await executeAction("launchPumpFunToken", params);

      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `Pump.fun token launched successfully`,
      });
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to launch Pump.fun token",
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
          <Action.SubmitForm title="Launch Token" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Token Name" placeholder="Enter token name" />
      <Form.TextField id="symbol" title="Token Symbol" placeholder="Enter token symbol" />
      <Form.TextArea id="description" title="Description" placeholder="Enter token description" />
      <Form.TextField id="imageUrl" title="Image URL" placeholder="Enter image URL" />
      <Form.TextField id="amount" title="Amount" placeholder="Enter token amount" />
      <Form.TextField id="twitter" title="Twitter (Optional)" placeholder="Enter Twitter handle" />
      <Form.TextField id="telegram" title="Telegram (Optional)" placeholder="Enter Telegram link" />
      <Form.TextField id="website" title="Website (Optional)" placeholder="Enter website URL" />
    </Form>
  );
}

export default withAccessToken(provider)(LaunchPumpFunToken);
