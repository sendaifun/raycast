import axios from "axios";
import { URL_ENDPOINTS } from "../constants/endpoints";
import { LocalStorage } from "@raycast/api";
import { STORAGE_KEYS } from "./constants";
import { PublicKey } from "@solana/web3.js";
import { CacheAdapter } from "./cache";

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface ApiParams {
  [key: string]: string | number | string[] | PublicKey;
}

// Helper function to create a cache key from method and params
function createCacheKey(method: string, params: ApiParams): string {
  // Convert params to a stable string representation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        const value = params[key];
        // Handle PublicKey serialization
        if (value instanceof PublicKey) {
          result[key] = value.toString();
        } else {
          result[key] = value;
        }
        return result;
      },
      {} as Record<string, unknown>,
    );

  return `api_${method}_${JSON.stringify(sortedParams)}`;
}

export async function executeAction<T>(
  method: string,
  params: ApiParams = {},
  useCache: boolean = false,
  cacheTimeMs?: number,
): Promise<ApiResponse<T>> {
  let cachedResult: ApiResponse<T> | null = null;
  let cache: CacheAdapter | null = null;

  // Only use cache if explicitly enabled
  if (useCache) {
    // Create cache key and check for cached result
    const cacheKey = createCacheKey(method, params);
    cache = new CacheAdapter(cacheKey);

    // Try to get cached result first
    cachedResult = cache.get<ApiResponse<T>>();
    if (cachedResult) return cachedResult;
  }

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

    // Cache the successful result only if caching is enabled
    if (useCache && cache) {
      const cacheTime = cacheTimeMs || 2 * 60 * 1000; // Default to 2 minutes if not specified
      cache.set(response.data, cacheTime);
      console.log(`Cached result for ${method} (${cacheTime} minutes)`);
    }

    return response.data;
  } catch (error) {
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
