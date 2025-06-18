import { executeAction } from "../shared/api-wrapper";

export default async function ({ to, amount, mint }: { to: string; amount: number; mint: string }) {
  try {
    console.log("transferring SPL token", to, amount, mint);
    const result = await executeAction("transferSPL", {
      to: to,
      amount: amount,
      mint: mint,
    });
    return {
      status: "success",
      message: "SPL transfer executed successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error executing SPL transfer",
      error: error,
    };
  }
}
