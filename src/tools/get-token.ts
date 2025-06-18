import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({ tokenAddress }: { tokenAddress: string }) => {
  try {
    console.log("getting token", tokenAddress);
    const result = await executeAction("getToken", {
      address: tokenAddress,
    });
    return {
      status: "success",
      message: "Token data retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving token data",
      error: error,
    };
  }
});
