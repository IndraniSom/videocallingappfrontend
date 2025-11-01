"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Send, Loader2 } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { FaChartArea } from "react-icons/fa";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChatPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [activeFriend, setActiveFriend] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;
  const userId = user?.id || "";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // 🧠 Fetch friends
  const fetchFriends = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/friends/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.friends?.filter(
        (f: any) => f.status === "accepted"
      );
      setFriends(list || []);
      console.log("✅ Friends fetched:", list);
    } catch (err) {
      console.error("❌ Fetch friends failed:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // 🧩 Fetch messages
  const fetchMessages = useCallback(
    async (friendId: string) => {
      if (!friendId || !userId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("private_chats")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });
      if (error) console.error("❌ Fetch messages error:", error);
      else setMessages(data || []);
      setLoading(false);
    },
    [userId]
  );

  // 🟢 Realtime listener
  useEffect(() => {
    if (!activeFriend || !userId) return;

    const friendId = activeFriend.user._id;
    const channel = supabase
      .channel("realtime:private_chats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_chats",
          filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId}))`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            return exists ? prev : [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeFriend, userId]);

  // 🟣 Send message
  const handleSend = async () => {
    if (!text.trim() || !activeFriend) return;
    const friendId = activeFriend.user._id;
    const { data, error } = await supabase
      .from("private_chats")
      .insert([
        {
          sender_id: userId,
          receiver_id: friendId,
          message: text.trim(),
        },
      ])
      .select();
    if (error) console.error("❌ Send message error:", error);
    else setMessages((prev) => [...prev, data[0]]);
    setText("");
  };

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
console.log("Active Friend:", user);
  return (
    <div className="min-h-screen flex bg-gray-100 text-black border-t-2 border-t-gray-400">
      {/* 🟩 Left Sidebar - Friends List */}
      <div className="w-80 shadow-2xl  bg-white flex flex-col">
        <div className="p-4 border-b border-gray-800 text-lg font-semibold bg-white text-black flex gap-2">
           <Image src="https://res.cloudinary.com/djamamkqn/image/upload/v1761569632/f635f885-d49b-4333-9495-d149401430e3-removebg-preview_rwpuhc.png" alt="" width={5} height={5} className="object-cover size-5"/> Chats
        </div>
        {friends.length === 0 ? (
          <div className="text-gray-400 text-center p-4">No friends yet</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {friends.map((f) => (
              <div
                key={f.user._id}
                onClick={() => {
                  setActiveFriend(f);
                  fetchMessages(f.user._id);
                }}
                className={`p-4 flex gap-2 cursor-pointer  transition ${
                  activeFriend?.user?._id === f.user._id ? "bg-red-200 de" : ""
                }`}
              >
                <Image src={`https://ui-avatars.com/api/?name=${f.user.firstName}`} unoptimized alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full object-cover bg-red-400" />
                <p className="font-medium text-black mt-2">{f.user.firstName} {f.user.lastName}</p>
               
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟦 Right Panel - Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`p-4  ${activeFriend
              ?"border-b-2":"border-b-0" } border-gray-300 bg-gray-100 text-black flex items-center justify-between`}>
                {activeFriend
              ? <Image src={`https://ui-avatars.com/api/?name=${activeFriend ? activeFriend.user.firstName : ""}`} unoptimized alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full object-cover bg-red-400 mr-3" />
              : null}
          <h2 className="text-xl font-semibold w-full">
            {activeFriend
              ? `${activeFriend.user.firstName}`
              : ""}
          </h2>
        </div>

        {/* Chat area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              <Loader2 className="animate-spin w-5 h-5" /> Loading...
            </div>
          ) : !activeFriend ? (
            <div className="w-full min-h-full flex flex-col items-center justify-center ">
              <Image src="https://res.cloudinary.com/djamamkqn/image/upload/v1761566933/email-envelope-inbox-shape-social-media-notification-icon-speech-bubbles-3d-cartoon-banner-website-ui-pink-background-3d-rendering-illustration-removebg-preview_wx55fj.png" alt="Chat Illustration" width={150} height={150} className="" />
            <div className="flex justify-center items-center h-full text-gray-600 text-3xl mb-2">
              Send and receive messages with your friends! 
            </div>
            <span className="text-gray-600 text-xl">Select a friend from the left to start chatting.</span>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-center">
              No messages yet — say hi 👋
            </p>
          ) : (
            messages.map((msg) => {
              const isYou = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isYou ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl shadow-md ${
                      isYou
                        ? "bg-red-600 text-white rounded-br-none"
                        : " text-black rounded-bl-none"
                    }`}
                  >
                    <p className="break-words">{msg.message}</p>
                    <div className="text-xs text-black mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        {activeFriend && (
          <div className="  p-3 flex items-center gap-2 bg-gray-100 sticky bottom-0">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-white text-black px-3 py-2 rounded-full outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-red-600 text-white p-3 rounded-full"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
