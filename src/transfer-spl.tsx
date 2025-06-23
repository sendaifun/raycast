import { ActionPanel, Action, Form, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";

interface PortfolioToken {
  address: string;
  decimals: number;
  balance: number;
  uiAmount: number;
  chainId: string;
  name: string;
  symbol: string;
  icon?: string;
  logoURI?: string;
  priceUsd: number;
  valueUsd: number;
}

function TransferSPL() {
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioTokens, setPortfolioTokens] = useState<PortfolioToken[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      setIsLoadingPortfolio(true);
      const result = await executeAction("getPortfolio");
      const portfolioResult = result as { data: { items: PortfolioToken[] } };

      if (
        portfolioResult &&
        portfolioResult.data &&
        portfolioResult.data.items &&
        Array.isArray(portfolioResult.data.items)
      ) {
        setPortfolioTokens(portfolioResult.data.items);
      } else {
        setPortfolioTokens([]);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load portfolio data",
      });
      setPortfolioTokens([]);
    } finally {
      setIsLoadingPortfolio(false);
    }
  }

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
          title: "Invalid token",
          message: "Please select a token from your portfolio",
        });
        return;
      }

      const result = await executeAction("transferSPL", {
        to: values.to,
        amount: amount,
        mintAddress: values.mintAddress,
      });

      if (result.status === "error") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: result.message,
        });
        return;
      }
      await showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `SPL token transfer executed successfully`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to execute SPL token transfer",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading || isLoadingPortfolio}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Transfer SPL" onSubmit={handleSubmit} />
          <Action title="Refresh Portfolio" onAction={loadPortfolio} />
        </ActionPanel>
      }
    >
      <Form.TextField id="to" title="To Address" placeholder="Enter wallet address" />
      <Form.Dropdown
        id="mintAddress"
        title="Token"
        placeholder="Select token from portfolio"
        isLoading={isLoadingPortfolio}
      >
        {portfolioTokens.map((token) => (
          <Form.Dropdown.Item
            key={token.address}
            value={token.address}
            title={`${token.symbol} (Balance: ${token.uiAmount.toFixed(4)})`}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField id="amount" title="Amount" placeholder="Enter amount to transfer" />
    </Form>
  );
}

export default withAccessToken(provider)(TransferSPL);
