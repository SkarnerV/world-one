import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CHAT_THREAD_CHAT_MODE } from "@/mocks/seed";
import type { ChatMessage, ChatThread } from "@/types";
import { AssistantMessage, Composer, ThinkingBubble, UserMessage } from "@/components/chat/MessageBubble";
import { Topbar } from "@/components/layout/Topbar";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ChatModePage() {
  const [thread, setThread] = useState<ChatThread>(CHAT_THREAD_CHAT_MODE);
  const [thinking, setThinking] = useState(false);
  const [, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ChatThread>("/sessions/sess_canvas_app/thread")
      .then((t) => {
        setThread(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSend(text: string) {
    const userMsg: ChatMessage = {
      id: `local_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setThread((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }));
    setThinking(true);
    try {
      const { message } = await api.post<{ message: ChatMessage }>(
        "/sessions/sess_canvas_app/messages",
        { content: text },
      );
      setThread((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    } finally {
      setThinking(false);
    }
  }

  function handleChoice(choiceId: string) {
    handleSend(`已选择：${choiceId}`);
  }

  return (
    <div className="h-full flex flex-col bg-app-bg">
      <Topbar title={thread.title} badge={{ label: "正在运行", tone: "info" }} />
      <div className="px-5 pt-4">
        <PageHeader
          page="PAGE 01"
          title="聊天模式"
          description="主对话页面：左侧查看和筛选历史对话，中间与智能体对话，右侧展示本轮 Agent 运行状态。"
        />
      </div>
      <div className="flex-1 min-h-0 px-5 pb-4">
        <div className="h-full rounded-lg border border-line bg-white flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-1.5 py-2">
            <div className="max-w-[1648px] mx-auto space-y-2">
              {thread.messages.map((m) =>
                m.role === "user" ? (
                  <UserMessage key={m.id} content={m.content} files={m.files} />
                ) : (
                  <AssistantMessage key={m.id} message={m} onChoice={handleChoice} />
                ),
              )}
              {thinking ? <ThinkingBubble /> : null}
            </div>
          </div>
          <div className="border-t border-line bg-white px-4 py-3">
            <div className="max-w-[1648px] mx-auto">
              <Composer onSend={handleSend} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
