import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({ inputs }: { inputs: string[] }) => {
  try {
    console.log("getting Sanctum LST APY", inputs);
    const result = await executeAction("sanctumGetLSTAPY", {
      inputs: inputs,
    });
    return {
      status: "success",
      message: "Sanctum LST APY retrieved successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error retrieving Sanctum LST APY",
      error: error,
    };
  }
});
