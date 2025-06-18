import axios from "axios";
import { URL_ENDPOINTS } from "../constants/endpoints";
import { LocalStorage } from "@raycast/api";
import { STORAGE_KEYS } from "../utils/constants";

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface ApiParams {
  [key: string]: string | number | string[];
}

export async function executeAction<T>(method: string, params: ApiParams = {}): Promise<ApiResponse<T>> {
  try {
    // TODO: if aunauthorised request from backend, throw error
    const token = await LocalStorage.getItem<string>(STORAGE_KEYS.BACKEND_SESSION_TOKEN);
    const response = await axios.post<ApiResponse<T>>(
      `${URL_ENDPOINTS.SEND_AI_API_URL}/execute.action`,
      {
        method,
        params,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
