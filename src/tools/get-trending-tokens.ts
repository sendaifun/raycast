import { executeAction } from "../shared/api-wrapper";

export default async function () {
  try {
    console.log("getting trending tokens");
    const result = await executeAction("getTrendingTokens");
    return {
      status: "success",
      message: "Trending tokens retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving trending tokens",
      error: error,
    };
  }
}
