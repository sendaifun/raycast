import { executeAction } from "../shared/api-wrapper";

export default async function ({ tokenAddress }: { tokenAddress: string }) {
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
}
