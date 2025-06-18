import { executeAction } from "../shared/api-wrapper";

export default async function ({ tokenId }: { tokenId: string }) {
  try {
    console.log("fetching price for token", tokenId);
    const result = await executeAction("fetchPrice", {
      tokenId: tokenId,
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
}
