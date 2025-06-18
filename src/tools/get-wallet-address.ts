import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async function () {
  try {
    console.log("getting wallet address");
    const result = await executeAction("getWalletAddress");
    return {
      status: "success",
      message: "Wallet address retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving wallet address",
      error: error,
    };
  }
});
