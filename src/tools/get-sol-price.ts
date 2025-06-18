import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async () => {
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
});
