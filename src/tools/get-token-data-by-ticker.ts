import { executeAction } from "../shared/api-wrapper";

export default async function ({ ticker }: { ticker: string }) {
  try {
    console.log("getting token data by ticker", ticker);
    const result = await executeAction("getTokenDataByTicker", {
      ticker: ticker,
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
}
