import { useState, useEffect, useCallback } from "react";
import { LocalStorage, showToast, Toast, open, closeMainWindow } from "@raycast/api";
import { STORAGE_KEYS } from "../utils/constants"; // Ensure this path is correct
import fetch from "node-fetch";
import crypto from "node:crypto";
import http from "node:http";
import url from "node:url";

// --- Configuration ---
const GOOGLE_CLIENT_ID = "12412930892-u4evro2g1oetdat7rtjrf508dinm9iq1.apps.googleusercontent.com";
const LOCAL_REDIRECT_URI = "http://localhost:31339/raycast-callback";
const SCOPES = ["openid", "email", "profile"];
const YOUR_BACKEND_CALLBACK_URL = "https://mrgbnbr5uk.execute-api.eu-central-1.amazonaws.com/auth/google/verify";

const AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"; // Added

// --- Helper Functions ---
function base64URLEncode(str: Buffer): string {
  return str.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function sha256(buffer: string): Buffer {
  return crypto.createHash("sha256").update(buffer).digest();
}

// --- Hook Interface ---
interface UseGoogleAuthReturn {
  isLoading: boolean;
  userEmail: string | null;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface BackendAuthResponse {
  token?: string; // Your backend's session token
  message?: string;
  // You might want to extend this if your backend returns user info
  // user?: { email?: string; name?: string };
}

// --- The Hook ---
export function useGoogleAuth(): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkLoginStatus() {
      setIsLoading(true);
      setError(null);
      try {
        const storedEmail = await LocalStorage.getItem<string>(STORAGE_KEYS.USER_EMAIL);
        if (isMounted && storedEmail) {
          setUserEmail(storedEmail);
        }
      } catch (err) {
        console.error("Failed to retrieve login status:", err);
        if (isMounted) setError("Could not retrieve login status.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkLoginStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await showToast(Toast.Style.Animated, "Starting Sign In...");

    let server: http.Server | null = null;
    const cleanup = async () => {
      server?.close();
      await LocalStorage.removeItem(STORAGE_KEYS.PKCE_VERIFIER);
      await LocalStorage.removeItem(STORAGE_KEYS.STATE);
    };

    try {
      // 1. Generate PKCE codes and state
      const codeVerifier = base64URLEncode(crypto.randomBytes(32));
      const codeChallenge = base64URLEncode(sha256(codeVerifier));
      const state = base64URLEncode(crypto.randomBytes(16));

      await LocalStorage.setItem(STORAGE_KEYS.PKCE_VERIFIER, codeVerifier);
      await LocalStorage.setItem(STORAGE_KEYS.STATE, state);

      // 2. Start local redirect server
      const serverPromise = new Promise<{
        receivedCode: string;
        receivedState: string;
      }>((resolve, reject) => {
        server = http.createServer(async (req, res) => {
          try {
            if (!req.url) throw new Error("Request URL not found");
            const parsedUrl = url.parse(req.url, true);
            const callbackPath = url.parse(LOCAL_REDIRECT_URI, true).pathname;

            if (parsedUrl.pathname === callbackPath) {
              const query = parsedUrl.query;
              const receivedCode = query.code as string;
              const receivedState = query.state as string;

              const storedState = await LocalStorage.getItem<string>(STORAGE_KEYS.STATE);
              if (receivedState !== storedState) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("State mismatch error.");
                reject(new Error("State mismatch"));
                return;
              }

              if (receivedCode) {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end("<h1>Success!</h1><p>Processing... You can close this window.</p>");
                resolve({ receivedCode, receivedState });
              } else if (query.error) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end(`Error: ${query.error_description || query.error}`);
                reject(new Error(query.error as string));
              } else {
                throw new Error("Invalid callback parameters");
              }
            } else {
              res.writeHead(404);
              res.end();
            }
          } catch (err) {
            console.error("Callback server error:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error during callback.");
            reject(err);
          } finally {
            server?.close();
          }
        });

        server.on("error", (err) => {
          console.error("Local server failed to start:", err);
          reject(err);
        });

        const port = Number.parseInt(LOCAL_REDIRECT_URI.split(":")[2].split("/")[0]);
        server.listen(port, () => {
          console.log(`Local server listening on ${LOCAL_REDIRECT_URI}`);
        });

        setTimeout(
          () => {
            reject(new Error("Sign-in timed out waiting for callback"));
            server?.close();
          },
          5 * 60 * 1000,
        );
      });

      // 3. Construct Google Authorization URL
      const authParams = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: LOCAL_REDIRECT_URI,
        response_type: "code",
        scope: SCOPES.join(" "),
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: state,
        access_type: "offline", // Request refresh token if needed
      });
      const authorizationUrl = `${AUTHORIZATION_ENDPOINT}?${authParams.toString()}`;

      // 4. Open browser
      await open(authorizationUrl);
      await showToast(Toast.Style.Animated, "Please sign in via your browser...");
      closeMainWindow();

      // 5. Wait for local server to get the authorization code
      const { receivedCode: authCodeFromCallback } = await serverPromise;
      if (!authCodeFromCallback) {
        throw new Error("Authorization code not received from local server.");
      }
      await showToast(Toast.Style.Animated, "Auth code received. Exchanging for tokens...");

      // 6. Retrieve PKCE verifier
      const storedVerifier = await LocalStorage.getItem<string>(STORAGE_KEYS.PKCE_VERIFIER);
      if (!storedVerifier) {
        throw new Error("PKCE Verifier not found. Cannot complete token exchange.");
      }

      // 7. Exchange authorization code for ID token with Google
      const tokenParams = new URLSearchParams({
        code: authCodeFromCallback,
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: LOCAL_REDIRECT_URI,
        grant_type: "authorization_code",
        code_verifier: storedVerifier,
      });
      console.log(tokenParams);

      const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenParams.toString(),
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error("Google token exchange error details:", errorBody);
        throw new Error(`Failed to exchange auth code with Google: ${tokenResponse.status} (See console for details)`);
      }

      const tokenData = (await tokenResponse.json()) as {
        id_token: string;
      };
      const idToken = tokenData?.id_token;
      // const accessToken = tokenData.access_token as string; // Also available
      // const refreshToken = tokenData.refresh_token as string; // If offline access granted

      if (!idToken) {
        console.error("ID token not found in Google's response:", tokenData);
        throw new Error(
          "ID token not received from Google. Check scopes (must include 'openid') and client configuration.",
        );
      }
      await showToast(Toast.Style.Animated, "ID Token received. Sending to backend...");

      // 8. Send the ID token to YOUR backend
      const backendResponse = await fetch(YOUR_BACKEND_CALLBACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Backend might expect JSON body
          Authorization: `Bearer ${idToken}`, // Common way to send ID token
        },
        // If your backend expects the token in the body:
        // body: JSON.stringify({ idToken: idToken }),
      });

      if (!backendResponse.ok) {
        const errorBody = await backendResponse.text();
        console.error("Backend verification error details:", errorBody);
        throw new Error(`Backend verification failed: ${backendResponse.status} (See console for details)`);
      }

      // 9. Process successful response from YOUR backend
      const backendData = (await backendResponse.json()) as BackendAuthResponse;
      console.log("Backend response data:", backendData);

      // 10. Extract email from ID Token, store it, and set state
      // It's generally better if your backend validates the ID token and returns
      // the canonical user email in its response (e.g., in backendData.user.email).
      // For now, we'll parse it from the ID token.
      let emailFromIdToken: string | null = null;
      try {
        const idTokenParts = idToken.split(".");
        if (idTokenParts.length < 2) throw new Error("Invalid ID token format");
        // Use 'base64url' for decoding JWT parts
        const payload = JSON.parse(Buffer.from(idTokenParts[1], "base64url").toString("utf-8"));

        if (payload?.email) {
          emailFromIdToken = payload.email;
          if (payload.email_verified === false) {
            console.warn("User's email in ID token is not verified by Google.");
            // You might want to handle this case specifically based on your app's policy
          }
        } else {
          console.warn("Email not found in ID token payload.");
        }
      } catch (e: any) {
        console.error("Error parsing ID token for email:", e.message);
        // This could be a critical error depending on your app's needs
      }

      if (emailFromIdToken) {
        await LocalStorage.setItem(STORAGE_KEYS.USER_EMAIL, emailFromIdToken);
        setUserEmail(emailFromIdToken);
      } else {
        // Handle case where email couldn't be determined.
        // This might mean sign-in is incomplete or user data is missing.
        console.warn("User email could not be determined after sign-in. Previous email (if any) will be kept.");
        // Optionally, clear any previously stored email if a new one isn't found
        // await LocalStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
        // setUserEmail(null);
      }

      if (backendData.token) {
        await LocalStorage.setItem(STORAGE_KEYS.BACKEND_SESSION_TOKEN, backendData.token);
      }

      await showToast(Toast.Style.Success, "Successfully Signed In!");
    } catch (err: any) {
      console.error("Sign-in process failed:", err);
      setError(err.message || "An unknown error occurred during sign in.");
      await showToast(Toast.Style.Failure, "Sign In Failed", err.message || "An unknown error occurred");
    } finally {
      await cleanup();
      setIsLoading(false);
    }
  }, []); // Dependencies are module-level constants

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await showToast(Toast.Style.Animated, "Signing Out...");
    try {
      await LocalStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
      await LocalStorage.removeItem(STORAGE_KEYS.BACKEND_SESSION_TOKEN);
      setUserEmail(null);

      // Optional: Call a logout endpoint on your backend
      // await fetch('https://your-backend.com/api/auth/logout', { method: 'POST', ... });

      await showToast(Toast.Style.Success, "Successfully Signed Out");
    } catch (err: any) {
      console.error("Sign out failed:", err);
      setError("Failed to sign out.");
      await showToast(Toast.Style.Failure, "Sign Out Failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, userEmail, error, signIn, signOut };
}
