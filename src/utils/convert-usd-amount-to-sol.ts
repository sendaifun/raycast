import { executeAction } from "./api-wrapper";

interface ConvertUsdAmountToSolParams {
  usdAmount: number;
}

export const convertUsdAmountToSol = async ({ usdAmount }: ConvertUsdAmountToSolParams) => {
  try {
    const result = await executeAction<number>("getSolPrice");
    const solPrice = result.data;
    if (!solPrice) {
      return {
        status: "error",
        message: "Error retrieving SOL price",
        error: "SOL price is not available",
      };
    }
    const solAmount = usdAmount / solPrice;
    return solAmount;
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving SOL price",
      error: error,
    };
  }
};
