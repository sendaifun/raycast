import axios from "axios";
import { URL_ENDPOINTS } from "../constants/endpoints";
import { LocalStorage } from "@raycast/api";
import { STORAGE_KEYS } from "./constants";
import { PublicKey } from "@solana/web3.js";

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface ApiParams {
  [key: string]: string | number | string[] | PublicKey;
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

    // If the response indicates an error, throw it so it can be caught by components
    if (response.data.status === "error") {
      throw new Error(response.data.message || "API request failed");
    }

    return response.data;
  } catch (error) {
    console.error(error);

    // Handle axios errors which contain backend response
    if (axios.isAxiosError(error) && error.response?.data) {
      const backendError = error.response.data;
      console.log(backendError);
      // If backend sent an error response, use its message
      if (backendError.status === "error" && backendError.message) {
        throw new Error(backendError.message);
      }
      // If backend sent a different error format, try to extract message
      if (backendError.message) {
        throw new Error(backendError.message);
      }
    }

    // create a new Error with a generic message
    throw new Error("Unknown error occurred");
  }
}
