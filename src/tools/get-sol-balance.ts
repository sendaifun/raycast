import { executeAction } from "../shared/api-wrapper";

export default async function () {
  try {
    console.log("getting SOL balance");
    const result = await executeAction("getSolBalance");
    return {
      status: "success",
      message: "SOL balance retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving SOL balance",
      error: error,
    };
  }
}
