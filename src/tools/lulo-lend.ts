import { executeAction } from "../shared/api-wrapper";

export default async function ({ amount }: { amount: number }) {
  try {
    console.log("lending tokens", amount);
    const result = await executeAction("luloLend", {
      amount: amount,
    });
    return {
      status: "success",
      message: "Lending executed successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error executing lending",
      error: error,
    };
  }
}
