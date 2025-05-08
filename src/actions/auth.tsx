import { Action, ActionPanel } from "@raycast/api";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export const AuthActionSection = () => {
  const { isLoggedIn, signIn, signOut } = useGoogleAuth();

  return (
    <ActionPanel.Section title="Authentication">
      {isLoggedIn ? (
        <Action title="Sign out" onAction={() => signOut()} />
      ) : (
        <Action title="Sign in with Google" onAction={() => signIn()} />
      )}
    </ActionPanel.Section>
  );
};
