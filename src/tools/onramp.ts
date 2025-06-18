import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({ amount }: { amount?: number }) => {
  try {
    console.log("getting onramp URL", amount);
    const params: Record<string, number> = {};
    if (amount) params.amount = amount;

    const result = await executeAction("onramp", params);
    return {
      status: "success",
      message: "Onramp URL generated successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error generating onramp URL",
      error: error,
    };
  }
});
