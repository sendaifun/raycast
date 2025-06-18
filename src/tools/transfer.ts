import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({ to, amount }: { to: string; amount: number }) => {
  try {
    console.log("transferring SOL", to, amount);
    const result = await executeAction("transfer", {
      to: to,
      amount: amount,
    });
    return {
      status: "success",
      message: "SOL transfer executed successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error executing SOL transfer",
      error: error,
    };
  }
});
