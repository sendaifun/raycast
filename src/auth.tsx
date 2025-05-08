import { ActionPanel, Action, List, Icon, Detail } from "@raycast/api";
import { useGoogleAuth } from "./hooks/useGoogleAuth"; // Adjust path if needed

export default function AuthView() {
  // Use the hook to get auth state and functions
  const { isLoading, error, signIn, signOut, isLoggedIn } = useGoogleAuth();

  // Show loading state
  if (isLoading) {
    return <Detail isLoading={true} />;
    // Or return <List isLoading={true}><List.EmptyView title="Loading..." /></List>;
  }

  // Show error state
  if (error && !isLoggedIn) {
    // Show error only if not logged in, otherwise might show transient errors
    return (
      <List>
        <List.EmptyView
          icon={Icon.Warning}
          title="Authentication Error"
          description={error}
          actions={
            <ActionPanel>
              <Action title="Retry Sign in" onAction={signIn} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  // Main UI based on login status
  return (
    <List>
      {isLoggedIn ? (
        // --- Logged In View ---
        <List.Section title="Account">
          <List.Item
            title="Signed in to Google"
            // subtitle={userEmail}
            icon={Icon.Person}
            actions={
              <ActionPanel>
                <Action title="Sign out" onAction={signOut} />
                {/* Add other actions for logged-in users */}
                {/* <Action.CopyToClipboard title="Copy Email" content={userEmail} /> */}
              </ActionPanel>
            }
          />
        </List.Section>
      ) : (
        // --- Logged Out View ---
        <List.EmptyView
          icon={Icon.Person}
          title="Not Signed In"
          description="Sign in with Google to continue."
          actions={
            <ActionPanel>
              <Action title="Sign in with Google" onAction={signIn} />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
