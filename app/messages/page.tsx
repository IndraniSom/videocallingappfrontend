"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Send, Loader2, Image as ImageIcon, Video, Mic, Smile, MoreVertical, Ban, Flag } from "lucide-react";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import Image from "next/image";
import EmojiPicker from "emoji-picker-react";
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
  const [lastMessages, setLastMessages] = useState<Map<string, any>>(new Map());
  const [onlineStatus, setOnlineStatus] = useState<Map<string, { isOnline: boolean; lastSeen?: Date }>>(new Map());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFriendMenu, setShowFriendMenu] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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
      const res = await axiosInstance.get(`${API_URL}/friends/friends`);
      const list = res.data?.friends?.filter(
        (f: any) => f.status === "accepted"
      );
      setFriends(list || []);
      
      // Fetch last messages for each friend
      if (list.length > 0) {
        const lastMsgRes = await axiosInstance.get(`${API_URL}/messages/last-messages`);
        const lastMsgMap = new Map();
        lastMsgRes.data.lastMessages.forEach((msg: any) => {
          const friendId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
          lastMsgMap.set(friendId, msg);
        });
        setLastMessages(lastMsgMap);
        
        // Fetch online status for each friend
        const statusPromises = list.map(async (f: any) => {
          try {
            const statusRes = await axiosInstance.get(`${API_URL}/messages/status/${f.user._id}`);
            return { friendId: f.user._id, status: statusRes.data };
          } catch {
            return { friendId: f.user._id, status: { isOnline: false } };
          }
        });
        const statuses = await Promise.all(statusPromises);
        const statusMap = new Map();
        statuses.forEach(({ friendId, status }) => {
          statusMap.set(friendId, status);
        });
        setOnlineStatus(statusMap);
      }
      
      console.log("✅ Friends fetched:", list);
    } catch (err) {
      console.error("❌ Fetch friends failed:", err);
    }
  }, [token, userId, API_URL]);

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
  const handleSend = async (file?: File) => {
    if ((!text.trim() && !file) || !activeFriend) return;
    const friendId = activeFriend.user._id;
    
    try {
      if (file) {
        setUploadingFile(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("receiverId", friendId);
        formData.append("message", text.trim());
        
        const res = await axiosInstance.post(`${API_URL}/messages/send`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        if (res.data.ok) {
          setMessages((prev) => [...prev, res.data.data]);
          fetchFriends(); // Refresh to update last message
        }
        setUploadingFile(false);
      } else {
        const { data, error } = await supabase
          .from("private_chats")
          .insert([
            {
              sender_id: userId,
              receiver_id: friendId,
              message: text.trim(),
              message_type: "text",
            },
          ])
          .select();
        if (error) console.error("❌ Send message error:", error);
        else {
          setMessages((prev) => [...prev, data[0]]);
          fetchFriends(); // Refresh to update last message
        }
      }
      setText("");
    } catch (err) {
      console.error("Send error:", err);
      setUploadingFile(false);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSend(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Handle emoji selection
  const onEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  // Block user
  const handleBlock = async (friendId: string) => {
    try {
      await axiosInstance.post(`${API_URL}/messages/block/${friendId}`);
      alert("User blocked successfully");
      fetchFriends();
      if (activeFriend?.user._id === friendId) {
        setActiveFriend(null);
      }
      setShowFriendMenu(null);
    } catch (err) {
      console.error("Block error:", err);
      alert("Failed to block user");
    }
  };
  
  // Report user
  const handleReport = async (friendId: string) => {
    const reason = prompt("Please provide a reason for reporting this user:");
    if (!reason) return;
    
    try {
      await axiosInstance.post(`${API_URL}/messages/report/${friendId}`, { reason });
      alert("User reported successfully");
      setShowFriendMenu(null);
    } catch (err) {
      console.error("Report error:", err);
      alert("Failed to report user");
    }
  };
  
  // Update online status
  useEffect(() => {
    if (!userId) return;
    
    // Set online when component mounts
    axiosInstance.post(`${API_URL}/messages/online`).catch(console.error);
    
    // Periodic refresh of online status
    const statusInterval = setInterval(() => {
      if (friends.length > 0) {
        friends.forEach(async (f: any) => {
          try {
            const statusRes = await axiosInstance.get(`${API_URL}/messages/status/${f.user._id}`);
            setOnlineStatus((prev) => {
              const newMap = new Map(prev);
              newMap.set(f.user._id, statusRes.data);
              return newMap;
            });
          } catch (err) {
            console.error("Status fetch error:", err);
          }
        });
      }
    }, 10000); // Refresh every 10 seconds
    
    // Set offline when component unmounts
    return () => {
      clearInterval(statusInterval);
      axiosInstance.post(`${API_URL}/messages/offline`).catch(console.error);
    };
  }, [userId, API_URL, friends]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
console.log("Active Friend:", user);
  return (
    <div className="min-h-screen flex bg-gray-100 text-black border-t-2 border-t-gray-400">
      {/* 🟩 Left Sidebar - Friends List */}
      <div className="w-80 shadow-2xl  bg-gradient-to-r from-purple-900 to-pink-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 text-lg font-semibold bg-gradient-to-r from-purple-900 to-pink-900 text-black flex gap-2">
           <Image src="https://res.cloudinary.com/djamamkqn/image/upload/v1761569632/f635f885-d49b-4333-9495-d149401430e3-removebg-preview_rwpuhc.png" alt="" width={5} height={5} className="object-cover size-5"/> Chats
        </div>
        {friends.length === 0 ? (
          <div className="text-gray-400 text-center p-4">No friends yet</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {friends.map((f) => {
              const friendId = f.user._id;
              const lastMsg = lastMessages.get(friendId);
              const status = onlineStatus.get(friendId);
              const isOnline = status?.isOnline || false;
              
              return (
                <div
                  key={friendId}
                  className={`p-4 flex gap-2 cursor-pointer transition relative ${
                    activeFriend?.user?._id === friendId ? "bg-red-200" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-1 flex items-center gap-2" onClick={() => {
                    setActiveFriend(f);
                    fetchMessages(friendId);
                  }}>
                    <div className="relative">
                      {f.user.profilePicture ? (
                        <img
                          src={f.user.profilePicture}
                          alt={`${f.user.firstName} ${f.user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Image 
                          src={`https://ui-avatars.com/api/?name=${f.user.firstName}`} 
                          unoptimized 
                          alt="avatar" 
                          width={40} 
                          height={40} 
                          className="w-10 h-10 rounded-full object-cover bg-red-400" 
                        />
                      )}
                      {/* Online status indicator */}
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-black truncate">{f.user.firstName} {f.user.lastName}</p>
                      </div>
                      {lastMsg && (
                        <p className="text-sm text-gray-500 truncate">
                          {lastMsg.message_type === "image" ? "📷 Image" :
                           lastMsg.message_type === "video" ? "🎥 Video" :
                           lastMsg.message_type === "audio" ? "🎵 Audio" :
                           lastMsg.message_type === "pdf" ? "📄 PDF" :
                           lastMsg.message_type === "document" ? "📄 Document" :
                           lastMsg.message || "No message"}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFriendMenu(showFriendMenu === friendId ? null : friendId);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showFriendMenu === friendId && (
                    <div className="absolute right-2 top-12 bg-gradient-to-r from-purple-900 to-pink-900 border border-gray-200 shadow-lg rounded-md p-2 z-10">
                      <button
                        onClick={() => handleBlock(friendId)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-left text-sm"
                      >
                        <Ban className="w-4 h-4" />
                        Block
                      </button>
                      <button
                        onClick={() => handleReport(friendId)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-left text-sm"
                      >
                        <Flag className="w-4 h-4" />
                        Report
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🟦 Right Panel - Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`p-4  ${activeFriend
              ?"border-b-2":"border-b-0" } border-gray-300 bg-gray-100 text-black flex items-center justify-between`}>
          {activeFriend ? (
            <>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeFriend.user.profilePicture ? (
                    <img
                      src={activeFriend.user.profilePicture}
                      alt={`${activeFriend.user.firstName} ${activeFriend.user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Image 
                      src={`https://ui-avatars.com/api/?name=${activeFriend.user.firstName}`} 
                      unoptimized 
                      alt="avatar" 
                      width={40} 
                      height={40} 
                      className="w-10 h-10 rounded-full object-cover bg-red-400" 
                    />
                  )}
                  {onlineStatus.get(activeFriend.user._id)?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {activeFriend.user.firstName} {activeFriend.user.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {onlineStatus.get(activeFriend.user._id)?.isOnline 
                      ? "Online" 
                      : "Offline"}
                  </p>
                </div>
              </div>
            </>
          ) : null}
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
              const isImage = msg.message_type === "image";
              const isVideo = msg.message_type === "video";
              const isAudio = msg.message_type === "audio";
              const isPdf = msg.message_type === "pdf";
              const isDocument = msg.message_type === "document";
              
              // Check if file_url is a Cloudinary URL (starts with http/https) or relative path
              const fileUrl = msg.file_url?.startsWith('http') 
                ? msg.file_url 
                : `${API_URL}${msg.file_url}`;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isYou ? "justify-end" : "justify-start"} mb-2`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl shadow-md ${
                      isYou
                        ? "bg-red-600 text-white rounded-br-none"
                        : "bg-gradient-to-r from-purple-900 to-pink-900 text-black rounded-bl-none"
                    }`}
                  >
                    {isImage && msg.file_url && (
                      <img 
                        src={fileUrl} 
                        alt="Shared image" 
                        className="max-w-full h-auto rounded-lg mb-2"
                        onError={(e) => {
                          console.error("Image load error:", fileUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {isVideo && msg.file_url && (
                      <video 
                        src={fileUrl} 
                        controls 
                        className="max-w-full h-auto rounded-lg mb-2"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {isAudio && msg.file_url && (
                      <audio 
                        src={fileUrl} 
                        controls 
                        className="w-full mb-2"
                      >
                        Your browser does not support the audio tag.
                      </audio>
                    )}
                    {(isPdf || isDocument) && msg.file_url && (
                      <div className="mb-2">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>{isPdf ? "PDF Document" : "Document"}</span>
                          <span className="text-xs text-gray-500">(Click to open)</span>
                        </a>
                      </div>
                    )}
                    {msg.message && (
                      <p className="break-words">{msg.message}</p>
                    )}
                    <div className={`text-xs mt-1 ${isYou ? "text-white/80" : "text-gray-500"} text-right`}>
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
          <div className="p-3 flex items-center gap-2 bg-gray-100 sticky bottom-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer p-2 hover:bg-gray-200 rounded-full"
              title="Upload file"
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </label>
            
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-200 rounded-full"
                title="Add emoji"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
            
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-gradient-to-r from-purple-900 to-pink-900 text-black px-3 py-2 rounded-full outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={uploadingFile || (!text.trim() && !fileInputRef.current?.files?.length)}
              className="bg-red-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              {uploadingFile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
