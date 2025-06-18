import { executeAction } from "../shared/api-wrapper";

export default async function () {
  try {
    console.log("getting Lulo APY");
    const result = await executeAction("luloGetApy");
    return {
      status: "success",
      message: "Lulo APY retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving Lulo APY",
      error: error,
    };
  }
}
