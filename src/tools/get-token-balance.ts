import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../utils/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({ tokenAddress }: { tokenAddress: string }) => {
  try {
    console.log("getting token balance", tokenAddress);
    const result = await executeAction("getTokenBalance", {
      mintAddress: tokenAddress,
    });
    return {
      status: "success",
      message: "Token balance retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving token balance",
      error: error,
    };
  }
});
