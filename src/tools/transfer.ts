import { executeAction } from "../shared/api-wrapper";

export default async function ({ to, amount }: { to: string; amount: number }) {
  try {
    console.log("transferring SOL", to, amount);
    const result = await executeAction("transfer", {
      to: to,
      amount: amount,
    });
    return {
      status: "success",
      message: "SOL transfer executed successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error executing SOL transfer",
      error: error,
    };
  }
}
