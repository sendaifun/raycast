import { executeAction } from "../shared/api-wrapper";

export default async function () {
  try {
    console.log("getting top LST tokens");
    const result = await executeAction("getTopLST");
    return {
      status: "success",
      message: "Top LST tokens retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving top LST tokens",
      error: error,
    };
  }
}
