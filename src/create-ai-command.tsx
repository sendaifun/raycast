import { CommandForm } from "./views/command/from";
import { useCommand } from "./hooks/useCommand";
import AuthProvider from "./components/AuthProvider";

export default function CreateAiCommand() {
  const commands = useCommand();

  return (
    <AuthProvider>
      {" "}
      <CommandForm use={{ commands }} />
    </AuthProvider>
  );
}
