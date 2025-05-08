import { getPreferenceValues, LocalStorage } from "@raycast/api";
import type { BackendTokenPayload, Preferences } from "../type";
import { createVercelAITools, SolanaAgentKit } from "solana-agent-kit";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import { backendClient, STORAGE_KEYS } from "../utils/constants";
import { jwtDecode } from "jwt-decode";

function hexToTransaction(hex: string) {
  try {
    return VersionedTransaction.deserialize(Buffer.from(hex, "hex"));
  } catch (e) {
    return Transaction.from(Buffer.from(hex, "hex"));
  }
}

async function signPayload(payloadHex: string, type: "signTransaction" | "signPayload", token: string) {
  const res = await backendClient.post(
    "/transactions/initiate-sign",
    {
      operation: type,
      payload: payloadHex,
      encoding: "hex",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = Buffer.from(res.data.signature, "hex");
  return data;
}

export default function useAgentKit() {
  const preferences = getPreferenceValues<Preferences>();

  const getAgentKit = async () => {
    const backendToken = await LocalStorage.getItem(STORAGE_KEYS.BACKEND_SESSION_TOKEN);
    const decodedToken = jwtDecode(backendToken as string) as BackendTokenPayload;
    return new SolanaAgentKit(
      {
        publicKey: new PublicKey(decodedToken.wallet),
        signMessage: async (message) => {
          const signedMessage = await signPayload(
            Buffer.from(message).toString("hex"),
            "signPayload",
            backendToken as string,
          );

          return signedMessage;
        },
        signTransaction: async (tx) => {
          const signedTx = await signPayload(
            Buffer.from(tx.serialize({ requireAllSignatures: false })).toString("hex"),
            "signTransaction",
            backendToken as string,
          );

          const decodedTx = hexToTransaction(signedTx.toString("hex"));

          return decodedTx as typeof tx;
        },
        signAllTransactions: async (txs) => {
          const signedTxs = [];

          for (const tx of txs) {
            const signedTx = await signPayload(
              Buffer.from(tx.serialize({ requireAllSignatures: false })).toString("hex"),
              "signTransaction",
              backendToken as string,
            );

            const decodedTx = hexToTransaction(signedTx.toString("hex"));

            signedTxs.push(decodedTx as typeof tx);
          }

          return signedTxs;
        },
        signAndSendTransaction: async (tx) => {
          try {
            const connection = new Connection(preferences.rpcUrl);
            const signedTx = await signPayload(
              Buffer.from(tx.serialize({ requireAllSignatures: false })).toString("hex"),
              "signTransaction",
              backendToken as string,
            );
            const decodedTx = hexToTransaction(signedTx.toString("hex"));
            const txid = await connection.sendRawTransaction(decodedTx.serialize(), {
              skipPreflight: true,
              preflightCommitment: "confirmed",
            });

            const confirmTx = await connection.confirmTransaction(txid, "confirmed");

            if (confirmTx.value.err) {
              throw new Error("Transaction failed");
            }
            return { signature: txid };
          } catch (e) {
            console.error("Error sending transaction:", e.data);
            throw e;
          }
        },
      },
      preferences.rpcUrl,
      {
        OPENAI_API_KEY: preferences.apiKey,
      },
    ).use(TokenPlugin);
  };

  const getTools = async () => {
    const resolvedAgentKit = await getAgentKit();
    return createVercelAITools(resolvedAgentKit, resolvedAgentKit.actions);
  };

  return { getAgentKit, getTools };
}
