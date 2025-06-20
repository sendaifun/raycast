import { withAccessToken } from "@raycast/utils";
import { executeAction } from "../shared/api-wrapper";
import { provider } from "../utils/auth";

export default withAccessToken(provider)(async ({ mint }: { mint: string }) => {
  try {
    console.log("checking rug for token", mint);
    const result = await executeAction("rugcheck", {
      mint: mint,
    });
    return {
      status: "success",
      message: "Rug check completed successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error performing rug check",
      error: error,
    };
  }
});
