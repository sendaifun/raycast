import { executeAction } from "../shared/api-wrapper";

export default async function () {
  try {
    console.log("getting SOL price");
    const result = await executeAction("getSolPrice");
    return {
      status: "success",
      message: "SOL price retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving SOL price",
      error: error,
    };
  }
}
