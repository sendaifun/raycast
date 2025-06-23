import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../utils/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async () => {
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
});
