import { getPreferenceValues } from "@raycast/api";
import { useMemo } from "react";
import type { Preferences } from "../type";
import { createVercelAITools, SolanaAgentKit } from "solana-agent-kit";

export default function useAgentKit() {
  const preferences = getPreferenceValues<Preferences>();

  const agentKit = useMemo(
    () =>
      new SolanaAgentKit(preferences.privateKey, preferences.rpcUrl, {
        OPENAI_API_KEY: preferences.apiKey,
      }),
    [],
  );

  const tools = useMemo(() => createVercelAITools(agentKit), [agentKit]);

  return { agentKit, tools };
}
