"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useSupabaseChat(roomId: string, userId: string) {
  const [messages, setMessages] = useState<any[]>([]);

  // ✅ Load all previous messages
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("call_room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error fetching chats:", error);
    } else {
      console.log("✅ Fetched messages:", data);
      setMessages(data || []);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ✅ Listen for realtime changes
  useEffect(() => {
    if (!roomId) return;
    console.log("🔔 Subscribing to Supabase Realtime for:", roomId);

    const channel = supabase
      .channel(`public:chats:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `call_room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("📩 New message received:", payload.new);
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        console.log("🟢 Realtime status:", status);
      });

    return () => {
      console.log("❌ Unsubscribing from Supabase Realtime:", roomId);
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // ✅ Send message
  const sendMessage = useCallback(
    async (receiverId: string, message: string) => {
      if (!message.trim() || !roomId) {
        console.warn("Cannot send message: missing roomId or message", { roomId, message });
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roomId, receiverId, message }),
        });
        const result = await res.json();
        if (!result.ok) {
          console.error("❌ Message send failed:", result.message);
        } else {
          console.log("✅ Message sent:", result);
        }
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    },
    [roomId]
  );

  return { messages, sendMessage };
}
