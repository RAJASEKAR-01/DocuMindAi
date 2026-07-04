import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useDocument } from "../features/documents/useDocuments";
import { useChatHistory, useSendChatMessage } from "../features/chat/useChat";

const Chat = () => {
  const { id } = useParams();
  const { data: document } = useDocument(id);
  const { data: messages, isLoading } = useChatHistory(id);
  const sendMessage = useSendChatMessage(id);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    setInput("");
    sendMessage.mutate(trimmed);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <Link to={`/analysis/${id}`} className="text-ink-muted hover:text-ink">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-bold truncate">Chat: {document?.originalFileName}</h1>
          <p className="text-xs text-ink-muted">Answers are grounded in this document only</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto card space-y-4 mb-4">
        {isLoading && <p className="text-sm text-ink-muted">Loading conversation...</p>}

        {!isLoading && !messages?.length && (
          <p className="text-sm text-ink-muted text-center py-8">
            Ask anything about this document — e.g. "What happens if I terminate early?"
          </p>
        )}

        {messages?.map((msg) => (
          <div key={msg._id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.role === "user" ? "bg-ink text-white rounded-br-sm" : "bg-paper-soft text-ink rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex justify-start">
            <div className="bg-paper-soft px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-ink-muted">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document..."
          className="input-field"
        />
        <button type="submit" className="btn-accent shrink-0" disabled={!input.trim() || sendMessage.isPending}>
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
