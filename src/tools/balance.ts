import { executeAction } from "../shared/api-wrapper";

export default async function () {
  try {
    console.log("getting balance");
    const result = await executeAction("getSolBalance");
    return {
      status: "success",
      message: "Balance retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving balance",
      error: error,
    };
  }
}
