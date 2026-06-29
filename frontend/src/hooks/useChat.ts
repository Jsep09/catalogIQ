import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { content: string }[];
  error?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function streamChat(
  message: string,
  onToken: (token: string) => void,
  onSources: (sources: { content: string }[]) => void,
) {
  const res = await fetch(`${API_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.replace("data: ", "").trim();
      if (raw === "[DONE]") return;

      try {
        const parsed = JSON.parse(raw);
        if (parsed.type === "sources") onSources(parsed.sources);
        if (parsed.type === "token") onToken(parsed.token);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // skip malformed SSE lines
      }
    }
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      setMessages((prev) => [...prev, { role: "user", content }]);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        await streamChat(
          content,
          (token) => {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = { ...last, content: last.content + token };
              return updated;
            });
          },
          (sources) => {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = { ...last, sources };
              return updated;
            });
          },
        );
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
            error: true,
          };
          return updated;
        });
      }
    },
  });

  return {
    messages,
    isLoading: mutation.isPending,
    sendMessage: (msg: string) => mutation.mutate(msg),
  };
}
