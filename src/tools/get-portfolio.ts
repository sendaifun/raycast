import { executeAction } from "../shared/api-wrapper";

export default async function () {
  try {
    console.log("getting portfolio");
    const result = await executeAction("getPortfolio");
    return {
      status: "success",
      message: "Portfolio retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving portfolio",
      error: error,
    };
  }
}
