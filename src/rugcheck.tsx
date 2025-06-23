import { ActionPanel, Action, showToast, Toast, Detail, LaunchProps } from "@raycast/api";
import { useEffect, useState } from "react";
import { executeAction } from "./utils/api-wrapper";
import { provider } from "./utils/auth";
import { withAccessToken } from "@raycast/utils";
import BuyTokenForm from "./views/buy-token-form";

interface RugcheckResult {
  status: string;
  data: {
    tokenProgram: string;
    tokenType: string;
    risks: string[];
    score: string;
    score_normalised: number;
  };
}

function getMarkdown(rugcheckResult: RugcheckResult, tokenAddress: string): string {
  const { data } = rugcheckResult;
  const scoreColor = data.score === "safe" ? "🟢" : data.score === "warning" ? "🟡" : "🔴";

  const risksList = data.risks.length > 0 ? data.risks.map((risk) => `- ${risk}`).join("\n") : "No risks detected";

  return `# Rugcheck Result

## Token Address
\`${tokenAddress}\`

---

## Safety Assessment
${scoreColor} ${data.score}

**Normalized Score:** ${data.score_normalised}/1

---

## Token Details
**Token Program:** \`${data.tokenProgram}\`

**Token Type:** ${data.tokenType || "Not specified"}

## Risks
${risksList}

---

*Analysis completed at ${new Date().toLocaleString()}*`;
}

function Rugcheck(props: LaunchProps<{ arguments: { tokenAddress: string } }>) {
  const [isLoading, setIsLoading] = useState(false);
  const [rugcheckResult, setRugcheckResult] = useState<RugcheckResult | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");

  useEffect(() => {
    if (props.arguments.tokenAddress) {
      setTokenAddress(props.arguments.tokenAddress);
      handleSubmit({ tokenAddress: props.arguments.tokenAddress });
    }
  }, [props.arguments.tokenAddress]);

  async function handleSubmit(values: { tokenAddress: string }) {
    try {
      setIsLoading(true);
      setTokenAddress(values.tokenAddress);

      if (!values.tokenAddress || values.tokenAddress.trim() === "") {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid token address",
          message: "Please enter a valid token address",
        });
        return;
      }

      const result = await executeAction("rugcheck", {
        tokenAddress: values.tokenAddress,
      });

      setRugcheckResult(result as RugcheckResult);
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to perform rugcheck",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <Detail markdown="Loading..." isLoading={isLoading} />;
  }

  if (!rugcheckResult) {
    return (
      <Detail
        markdown="### Rugcheck\n\nEnter a token address as an argument to check if the token is safe from rug pulls."
        actions={
          <ActionPanel>
            <Action title="Refresh" onAction={() => tokenAddress && handleSubmit({ tokenAddress })} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Detail
      isLoading={isLoading}
      markdown={getMarkdown(rugcheckResult, tokenAddress)}
      actions={
        <ActionPanel>
          <Action.Push title="Buy" target={<BuyTokenForm arguments={{ outputMint: tokenAddress }} />} />
          <Action title="Refresh" onAction={() => handleSubmit({ tokenAddress })} />
        </ActionPanel>
      }
    />
  );
}

export default withAccessToken(provider)(Rugcheck);
