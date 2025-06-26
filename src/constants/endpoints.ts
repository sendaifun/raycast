const BASE_URL = "https://mrgbnbr5uk.execute-api.eu-central-1.amazonaws.com";

export const URL_ENDPOINTS = {
  TRANSACTION_SIGN_URL: `${BASE_URL}/transactions/initiate-sign`,
  AUTH_GOOGLE_VERIFY_URL: `${BASE_URL}/auth/google/verify`,
  GOOGLE_AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
  GOOGLE_FETCH_USER_INFO_URL: "https://www.googleapis.com/oauth2/v3/userinfo",
  GOOGLE_TOKEN_URL: "https://oauth2.googleapis.com/token",
  SEND_AI_API_URL: "https://api.sendai.fun/api",
  SEND_AI_API_URL_LOCAL: "http://localhost:8787/api",
} as const;
