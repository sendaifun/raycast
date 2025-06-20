import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({
  outputMint,
  inputAmount,
}: {
  outputMint: string;
  inputAmount: string;
}) => {
  try {
    console.log("buying token", outputMint, inputAmount);
    const result = await executeAction("buy", {
      outputMint: outputMint,
      inputAmount: parseFloat(inputAmount),
    });
    return {
      status: "success",
      message: "Trade executed successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error executing trade",
      error: error,
    };
  }
});
