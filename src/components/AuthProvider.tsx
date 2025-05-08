import { useEffect } from "react";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { showToast, Toast, Detail, ActionPanel } from "@raycast/api";
import { AuthActionSection } from "../actions/auth";

export default function AuthProvider(props: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useGoogleAuth();

  useEffect(() => {
    if (!isLoggedIn && !isLoading) {
      showToast({
        title: "Please log in",
        message: "You need to log in to use this feature",
        style: Toast.Style.Failure,
      });
    }
  }, [isLoggedIn, isLoading]);

  // return <>{isLoggedIn ? props.children : <Detail markdown={"Please log in to access this action"} />}</>;
  return (
    <>
      {isLoggedIn ? (
        props.children
      ) : !isLoading ? (
        <>
          <Detail
            markdown={"Please log in to access this command"}
            isLoading={isLoading}
            actions={
              <ActionPanel>
                <AuthActionSection />
              </ActionPanel>
            }
            navigationTitle="Login Required"
          />
        </>
      ) : (
        <Detail />
      )}
    </>
  );
}
