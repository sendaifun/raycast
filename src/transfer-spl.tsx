import { ActionPanel, Action, Form, showToast, Toast, Image } from "@raycast/api";
import { useState, useEffect } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken, useForm } from "@raycast/utils";
import { PortfolioToken } from "./type";

interface FormValues {
  to: string;
  mintAddress: string;
  amount: string;
}

function TransferSPL() {
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioTokens, setPortfolioTokens] = useState<PortfolioToken[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const { handleSubmit, itemProps, reset } = useForm<FormValues>({
    async onSubmit(values) {
      await handleTransfer(values);
      reset();
    },
    validation: {
      to: (value) => {
        if (!value || value.trim() === "") {
          return "Please enter a valid wallet address";
        }
      },
      mintAddress: (value) => {
        if (!value || value.trim() === "") {
          return "Please select a token from your portfolio";
        }
      },
      amount: (value) => {
        if (!value || value.trim() === "") {
          return "Please enter an amount";
        }
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
          return "Please enter a valid amount greater than 0";
        }
      },
    },
  });

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

  async function handleTransfer(values: FormValues) {
    try {
      setIsLoading(true);
      const amount = parseFloat(values.amount);

      const result = await executeAction<{ signature: string }>("transferSPL", {
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

      setTxHash(result.data?.signature);
      loadPortfolio();
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
      searchBarAccessory={
        txHash ? <Form.LinkAccessory target={`https://solscan.io/tx/${txHash}`} text="View on Solscan" /> : null
      }
    >
      <Form.TextField {...itemProps.to} title="To Address" placeholder="Enter wallet address" />
      <Form.Dropdown
        {...itemProps.mintAddress}
        title="Token"
        placeholder="Select token from portfolio"
        isLoading={isLoadingPortfolio}
      >
        {portfolioTokens.map((token) => (
          <Form.Dropdown.Item
            key={token.address}
            value={token.address}
            title={`${token.symbol} (Balance: ${token.uiAmount.toFixed(4)})`}
            icon={{ source: token.logoURI, mask: Image.Mask.Circle }}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField {...itemProps.amount} title="Amount" placeholder="Enter amount to transfer" />
    </Form>
  );
}

export default withAccessToken(provider)(TransferSPL);
