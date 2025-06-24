import { useState, useEffect, useCallback } from "react";
import { LocalStorage, showToast, Toast } from "@raycast/api";
import { BACKEND_CALLBACK_URL, STORAGE_KEYS } from "../utils/constants";
import fetch from "node-fetch";
import { OAuth } from "@raycast/api";
import { BackendAuthResponse } from "../type";

const GOOGLE_CLIENT_ID = "12412930892-lglh33r17pqmobh28op3v9rv5nj9trbg.apps.googleusercontent.com";

export const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.AppURI,
  providerName: "Google",
  providerIcon: "google-logo.jpg",
  providerId: "google",
  description: "Connect your Google account\n(Solana Agent)",
});

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkLoginStatus() {
      setIsLoading(true);
      const tokenSet = await client.getTokens();
      if (tokenSet?.accessToken) {
        setIsLoggedIn(true);
      }
      setError(null);
      setIsLoading(false);
    }
    checkLoginStatus();
  }, []);

  const signIn = useCallback(async () => {
    try {
      await showToast(Toast.Style.Animated, "Signing In...");
      const tokenSet = await client.getTokens();
      if (tokenSet?.accessToken) {
        if (tokenSet.refreshToken && tokenSet.isExpired()) {
          await client.setTokens(await refreshTokens(tokenSet.refreshToken));
          const res = await fetch(BACKEND_CALLBACK_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${(await client.getTokens())?.idToken}`,
            },
          });
          const data = (await res.json()) as BackendAuthResponse;
          if (data.token) {
            await LocalStorage.setItem(STORAGE_KEYS.BACKEND_SESSION_TOKEN, data.token);
          }
        }
        setIsLoggedIn(true);
        return;
      }

      const authRequest = await client.authorizationRequest({
        endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        clientId: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      });
      const { authorizationCode } = await client.authorize(authRequest);
      const tokens = await fetchTokens(authRequest, authorizationCode);
      await client.setTokens(tokens);

      const res = await fetch(BACKEND_CALLBACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.id_token}`,
        },
      });
      const data = (await res.json()) as BackendAuthResponse;
      if (res.status !== 200) {
        console.error("Backend authentication error:", data.message);
        throw new Error(data.message);
      }

      if (data.token) {
        await LocalStorage.setItem(STORAGE_KEYS.BACKEND_SESSION_TOKEN, data.token);
      }

      setIsLoggedIn(true);
      await showToast(Toast.Style.Success, "Successfully Signed In");
    } catch (e) {
      console.error("Sign in error:", e);
      setError("Failed to sign in.");
      await showToast(Toast.Style.Failure, "Sign In Failed");
    }
  }, []); // Dependencies are module-level constants

  async function fetchTokens(authRequest: OAuth.AuthorizationRequest, authCode: string): Promise<OAuth.TokenResponse> {
    const params = new URLSearchParams();
    params.append("client_id", GOOGLE_CLIENT_ID);
    params.append("code", authCode);
    params.append("verifier", authRequest.codeVerifier);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", authRequest.redirectURI);

    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: params });
    if (!response.ok) {
      console.error("fetch tokens error:", await response.text());
      throw new Error(response.statusText);
    }
    return (await response.json()) as OAuth.TokenResponse;
  }

  async function refreshTokens(refreshToken: string): Promise<OAuth.TokenResponse> {
    const params = new URLSearchParams();
    params.append("client_id", GOOGLE_CLIENT_ID);
    params.append("refresh_token", refreshToken);
    params.append("grant_type", "refresh_token");

    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: params });
    if (!response.ok) {
      console.error("refresh tokens error:", await response.text());
      throw new Error(response.statusText);
    }
    const tokenResponse = (await response.json()) as OAuth.TokenResponse;
    tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken;
    return tokenResponse;
  }

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await showToast(Toast.Style.Animated, "Signing Out...");
    try {
      await client.removeTokens();
      await LocalStorage.removeItem(STORAGE_KEYS.BACKEND_SESSION_TOKEN);

      setIsLoggedIn(false);
      await showToast(Toast.Style.Success, "Successfully Signed Out");
    } catch (err) {
      console.error("Sign out failed:", err);
      setError("Failed to sign out.");
      await showToast(Toast.Style.Failure, "Sign Out Failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, signIn, signOut, isLoggedIn };
}
