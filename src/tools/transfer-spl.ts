import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({ to, amount, mint }: { to: string; amount: string; mint: string }) => {
  try {
    console.log("transferring SPL token", to, amount, mint);
    const result = await executeAction("transferSPL", {
      to: to,
      amount: parseFloat(amount),
      mint: mint,
    });
    return {
      status: "success",
      message: "SPL transfer executed successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error executing SPL transfer",
      error: error,
    };
  }
});
