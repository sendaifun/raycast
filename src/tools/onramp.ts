import { executeAction } from "../shared/api-wrapper";

export default async function ({ amount }: { amount?: number }) {
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
}
