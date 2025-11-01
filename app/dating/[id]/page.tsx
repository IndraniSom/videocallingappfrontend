"use client";
import { useParams } from "next/navigation";
import { usePrivateChat } from "@/hooks/usePrivateChat";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Check, CheckCheck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PrivateChatPage() {
  const { id } = useParams(); // friendId
  const { messages, sendMessage, loading } = usePrivateChat(id as string);

  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [deliveredMessages, setDeliveredMessages] = useState<string[]>([]);
  const [readMessages, setReadMessages] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ Current user ID
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;
  const userId = user?.id || "";

  // 🧠 Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🟢 TYPING indicator via Supabase
  useEffect(() => {
    if (!userId || !id) return;
    const channel = supabase.channel(`typing_${userId}_${id}`);

    // listen for partner typing
    channel.on("broadcast", { event: "typing" }, (payload) => {
      if (payload.sender !== userId) {
        setPartnerTyping(payload.isTyping);
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, id]);

  // Broadcast typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setIsTyping(true);

    supabase.channel(`typing_${id}_${userId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { sender: userId, isTyping: true },
    });

    // stop typing after delay
    setTimeout(() => {
      setIsTyping(false);
      supabase.channel(`typing_${id}_${userId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { sender: userId, isTyping: false },
      });
    }, 1500);
  };

  // 🟣 Mark messages as delivered/read (mock logic for now)
  useEffect(() => {
    if (messages.length > 0) {
      const unread = messages
        .filter((msg) => msg.receiver_id === userId && !readMessages.includes(msg.id))
        .map((msg) => msg.id);

      if (unread.length > 0) {
        setReadMessages((prev) => [...prev, ...unread]);
      }

      const allIds = messages.map((m) => m.id);
      setDeliveredMessages(allIds);
    }
  }, [messages, userId, readMessages]);

  // ✉️ Send message
  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text);
    setText("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          💬 Chat
          {partnerTyping && (
            <span className="text-sm text-gray-400 animate-pulse">typing...</span>
          )}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <Loader2 className="animate-spin w-5 h-5" /> Loading...
          </div>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const isYou = msg.sender_id === userId;
            const isDelivered = deliveredMessages.includes(msg.id);
            const isRead = readMessages.includes(msg.id);

            return (
              <div
                key={msg.id}
                className={`flex ${isYou ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-xs px-4 py-2 rounded-2xl shadow-md ${
                    isYou
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-100 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.message}</p>
                  <div className="text-xs text-gray-300 mt-1 flex items-center gap-1 justify-end">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isYou && (
                      <>
                        {isRead ? (
                          <CheckCheck className="w-4 h-4 text-green-400" />
                        ) : isDelivered ? (
                          <Check className="w-4 h-4 text-gray-300" />
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-3 flex items-center gap-2 bg-gray-900">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-full outline-none"
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
