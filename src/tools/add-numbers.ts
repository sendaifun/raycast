import { executeAction } from "../shared/api-wrapper";
import { withAccessToken } from "@raycast/utils";
import { provider } from "../utils/auth";
import { LocalStorage } from "@raycast/api";
import { STORAGE_KEYS } from "../utils/constants";

export default withAccessToken(provider)(async ({ a, b }: { a: number; b: number }) => {
  try {
    console.log("adding numbers", a, b);
    const token = await LocalStorage.getItem<string>(STORAGE_KEYS.BACKEND_SESSION_TOKEN);
    console.log("token", token);
    const result = await executeAction("addNumbers", {
      a: a,
      b: b,
    });
    return {
      status: "success",
      message: "Numbers added successfully",
      result: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Error adding numbers",
      error: error,
    };
  }
});
