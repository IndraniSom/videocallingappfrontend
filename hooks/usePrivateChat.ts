"use client";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useCallback } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function usePrivateChat(friendId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;
  const userId = user?.id || "";

  // 1️⃣ Load all messages initially
  const fetchMessages = useCallback(async () => {
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
  }, [friendId, userId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 2️⃣ Subscribe to realtime updates
  useEffect(() => {
    if (!friendId || !userId) return;

    console.log("✅ Subscribing to realtime messages...");

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
          console.log("📩 New realtime message:", payload.new);
          setMessages((prev) => {
            // Avoid duplicates
            const exists = prev.some((m) => m.id === payload.new.id);
            return exists ? prev : [...prev, payload.new];
          });
        }
      )
      .subscribe((status) => console.log("🔌 Realtime status:", status));

    return () => {
      console.log("🛑 Unsubscribing from realtime...");
      supabase.removeChannel(channel);
    };
  }, [friendId, userId]);

  // 3️⃣ Send message + instant local update
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !friendId || !userId) {
        console.warn("❌ Missing data for sendMessage:", { text, friendId, userId });
        return;
      }

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
      else {
        console.log("📤 Message sent successfully:", data[0]);
        // Optimistic update for instant feedback
        setMessages((prev) => [...prev, data[0]]);
      }
    },
    [friendId, userId]
  );

  return { messages, sendMessage, loading };
}
