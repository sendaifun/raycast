import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async function () {
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
});
