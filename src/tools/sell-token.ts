import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({
  inputAmount,
  inputMint,
}: {
  inputAmount: string;
  inputMint: string;
}) => {
  try {
    console.log("selling token", inputMint, inputAmount);
    const result = await executeAction("sell", {
      inputAmount: parseFloat(inputAmount),
      inputMint: inputMint,
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
