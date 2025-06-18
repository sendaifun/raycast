import { executeAction } from "../shared/api-wrapper";

export default async function ({ amount }: { amount: number }) {
  try {
    console.log("generating bridge URL", amount);
    const result = await executeAction("bridge", {
      amount: amount,
    });
    return {
      status: "success",
      message: "Bridge URL generated successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error generating bridge URL",
      error: error,
    };
  }
}
