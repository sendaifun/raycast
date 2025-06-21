import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";
import { PublicKey } from "@solana/web3.js";

export default withAccessToken(provider)(async ({ tokenId }: { tokenId: string }) => {
  try {
    console.log("fetching price for token", tokenId);
    const result = await executeAction("fetchPrice", {
      tokenId: new PublicKey(tokenId),
    });
    return {
      status: "success",
      message: "Token price retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving token price",
      error: error,
    };
  }
});
