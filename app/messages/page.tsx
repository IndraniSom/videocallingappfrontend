"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Send, Loader2, Image as ImageIcon, Video, Mic, Smile, MoreVertical, Ban, Flag } from "lucide-react";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import Image from "next/image";
import EmojiPicker from "emoji-picker-react";
import { useUserProfile } from "@/hooks/useUserProfile";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import { MessageCircle } from "lucide-react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { user, loading: userLoading } = useUserProfile();
  const userId = user?._id || user?.id || "";
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
      console.error("⚠ Fetch friends failed:", err);
    }
  }, [token, userId, API_URL]);

  useEffect(() => {
    if (!userLoading) {
      fetchFriends();
    }
  }, [fetchFriends, userLoading]);

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
      if (error) console.error("⚠ Fetch messages error:", error);
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
          fetchFriends();
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
        if (error) console.error("⚠ Send message error:", error);
        else {
          setMessages((prev) => [...prev, data[0]]);
          fetchFriends();
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
  if (!file) return;

  setSelectedFile(file);
  setPreviewUrl(URL.createObjectURL(file));

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
    
    axiosInstance.post(`${API_URL}/messages/online`).catch(console.error);
    
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
    }, 10000);
    
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

  return (
    <div className="w-full min-h-screen bg-[#5940df] flex items-center justify-center">
      <div className="w-full max-w-5xl bg-[#654bf1] px-2 pt-2 pb-2 rounded-lg shadow-lg mx-4 my-4 h-[520px]">
        <div className=" h-125 flex flex-col md:flex-row gap-5 overflow-hidden">
          
          {/* 🟩 Left Sidebar - Friends List */}
          <div className={`${activeFriend ? 'hidden md:flex' : 'flex'} md:w-96 w-full bg-[#4a3a6a] flex flex-col rounded-2xl overflow-hidden h-full`}>
            <div className="p-6 border-b border-[#5a4a7a] text-xl font-bold bg-gradient-to-r from-[#6b4fd4] to-[#5940df] text-white flex gap-3 items-center">
              <MessageCircle className="w-6 h-6" /> Messages
            </div>
            {friends.length === 0 ? (
              <div className="text-gray-400 text-center p-8 flex flex-col items-center justify-center flex-1">
                <MessageCircle className="w-16 h-16 mb-4 text-[#6b4fd4] opacity-50" />
                <p className="text-lg">No friends yet</p>
                <p className="text-sm text-gray-500 mt-2">Add friends to start chatting</p>
              </div>
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
                      onClick={() => {
                        setActiveFriend(f);
                        fetchMessages(friendId);
                      }}
                      className={`p-4 flex gap-3 cursor-pointer transition-all duration-300 border-b border-[#3a2a5a] relative ${
                        activeFriend?.user?._id === friendId 
                          ? "bg-gradient-to-r from-[#6b4fd4] to-[#5940df] shadow-lg" 
                          : "hover:bg-[#5a4a7a]"
                      }`}
                    >
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          {f.user.profilePicture ? (
                            <img
                              src={f.user.profilePicture}
                              alt={`${f.user.firstName} ${f.user.lastName}`}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6b4fd4]"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Image 
                              src={`https://ui-avatars.com/api/?name=${f.user.firstName}`} 
                              unoptimized 
                              alt="avatar" 
                              width={48} 
                              height={48} 
                              className="w-12 h-12 rounded-full object-cover bg-gradient-to-br from-pink-500 to-red-500" 
                            />
                          )}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#4a3a6a] ${
                            isOnline ? "bg-green-500" : "bg-gray-500"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-white truncate">{f.user.firstName} {f.user.lastName}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${isOnline ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                              {isOnline ? "Online" : "Offline"}
                            </span>
                          </div>
                          {lastMsg && (
                            <p className="text-sm text-gray-400 truncate mt-1">
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
                        className="p-2 hover:bg-[#3a2a5a] rounded-full flex-shrink-0 transition"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-300" />
                      </button>
                      {showFriendMenu === friendId && (
                        <div className="absolute right-4 top-16 bg-[#3a2a5a] border border-[#5a4a7a] shadow-xl rounded-xl p-2 z-10">
                          <button
                            onClick={() => handleBlock(friendId)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#4a3a6a] rounded-lg text-left text-sm text-white transition"
                          >
                            <Ban className="w-4 h-4" />
                            Block User
                          </button>
                          <button
                            onClick={() => handleReport(friendId)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 rounded-lg text-left text-sm text-red-400 transition"
                          >
                            <Flag className="w-4 h-4" />
                            Report User
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
          <div className=" flex-1 flex flex-col bg-gradient-to-b from-[#3a2a5a] to-[#2a1a4a] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className={`p-6 transition-all duration-300 ${activeFriend ? "border-b border-[#5a4a7a]" : "border-b-0"} text-white flex items-center justify-between rounded-t-2xl`}>
              {activeFriend ? (
                <>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveFriend(null)}
                      className="md:hidden p-2 hover:bg-[#5a4a7a] rounded-lg transition"
                    >
                      ←
                    </button>
                    <div className="relative">
                      {activeFriend.user.profilePicture ? (
                        <img
                          src={activeFriend.user.profilePicture}
                          alt={`${activeFriend.user.firstName} ${activeFriend.user.lastName}`}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6b4fd4]"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Image 
                          src={`https://ui-avatars.com/api/?name=${activeFriend.user.firstName}`} 
                          unoptimized 
                          alt="avatar" 
                          width={48} 
                          height={48} 
                          className="w-12 h-12 rounded-full object-cover bg-gradient-to-br from-pink-500 to-red-500" 
                        />
                      )}
                      {onlineStatus.get(activeFriend.user._id)?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#4a3a6a] bg-green-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {activeFriend.user.firstName} {activeFriend.user.lastName}
                      </h2>
                      <p className={`text-sm ${onlineStatus.get(activeFriend.user._id)?.isOnline ? "text-green-400" : "text-gray-400"}`}>
                        {onlineStatus.get(activeFriend.user._id)?.isOnline 
                          ? "🟢 Online" 
                          : "⚫ Offline"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-gray-400">
                  {/* Empty state when no chat selected */}
                </div>
              )}
            </div>

            {/* Chat area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-full text-gray-400">
                  <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading messages...
                </div>
              ) : !activeFriend ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <MessageCircle className="w-24 h-24 text-[#6b4fd4] opacity-30 mb-4" />
                  <p className="text-2xl font-bold text-white mb-2">No chat selected</p>
                  <p className="text-gray-400 text-center">Select a friend from the list to start messaging</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Smile className="w-16 h-16 text-[#6b4fd4] opacity-30 mb-4" />
                  <p className="text-gray-400 text-center">No messages yet — say hi 👋</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isYou = String(msg.sender_id).trim() === String(userId).trim();
                  console.log("Message sender_id:", msg.sender_id, "userId:", userId, "isYou:", isYou);
                  const isImage = msg.message_type === "image";
                  const isVideo = msg.message_type === "video";
                  const isAudio = msg.message_type === "audio";
                  const isPdf = msg.message_type === "pdf";
                  const isDocument = msg.message_type === "document";

                  const fileUrl = msg.file_url?.startsWith('http')
                    ? msg.file_url
                    : `${API_URL}${msg.file_url}`;

                  // Get sender profile info
                  const senderProfile = isYou ? user : activeFriend?.user;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isYou ? "justify-end" : "justify-start"} mb-4`}
                    >
                      {!isYou && (
                        <div className="flex-shrink-0 mr-3">
                          {senderProfile?.profilePicture ? (
                            <img
                              src={senderProfile.profilePicture}
                              alt={`${senderProfile.firstName || senderProfile.firstname || ''} ${senderProfile.lastName || senderProfile.lastname || ''}`}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#6b4fd4]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Create fallback avatar
                                const fallback = document.createElement('div');
                                fallback.className = 'w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white text-xs font-bold';
                                fallback.textContent = (senderProfile?.firstName || senderProfile?.firstname || 'U')[0].toUpperCase();
                                target.parentNode?.replaceChild(fallback, target);
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                              {(senderProfile?.firstName || senderProfile?.firstname || 'U')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-md transition-all ${
                          isYou
                            ? "bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-br-none"
                            : "bg-[#4a3a6a] text-gray-100 rounded-bl-none border border-[#5a4a7a]"
                        }`}
                      >
                        {isImage && msg.file_url && (
                          <img 
                            src={fileUrl} 
                            alt="Shared image" 
                            className="max-w-[180px] md:max-w-[240px] lg:max-w-[300px] rounded-lg mb-2"
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
                              className={`flex items-center gap-2 p-3 rounded-lg text-sm transition ${
                                isYou 
                                  ? "bg-white/20 hover:bg-white/30" 
                                  : "bg-[#3a2a5a] hover:bg-[#5a4a7a]"
                              }`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span>{isPdf ? "PDF Document" : "Document"}</span>
                              <span className="text-xs opacity-75">(Click to open)</span>
                            </a>
                          </div>
                        )}
                        {msg.message && (
                          <p className="break-words">{msg.message}</p>
                        )}
                        <div className={`text-xs mt-2 ${isYou ? "text-white/70" : "text-gray-400"} text-right`}>
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
{previewUrl && (
  <div className="px-6 py-3 bg-[#3a2a5a] border-t border-[#5a4a7a] flex items-center gap-4">
    <img
      src={previewUrl}
      alt="preview"
      className="w-24 h-24 object-cover rounded-lg"
    />
    <div className="flex gap-2">
      <button
        onClick={() => {
          setPreviewUrl(null);
          setSelectedFile(null);
        }}
        className="px-4 py-2 rounded-lg bg-gray-600 text-white"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          handleSend(selectedFile!);
          setPreviewUrl(null);
          setSelectedFile(null);
        }}
        className="px-4 py-2 rounded-lg bg-pink-500 text-white"
      >
        Send
      </button>
    </div>
  </div>
)}

            {/* Input */}
            {activeFriend && (
              
              <div className="p-6 flex items-center gap-3 bg-[#4a3a6a] border-t border-[#5a4a7a] rounded-b-2xl">
                
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
                  className="cursor-pointer p-2 hover:bg-[#5a4a7a] rounded-full transition"
                  title="Upload file"
                >
                  <ImageIcon className="w-5 h-5 text-gray-300 hover:text-white transition" />
                </label>
                
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-[#5a4a7a] rounded-full transition"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5 text-gray-300 hover:text-white transition" />
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
                  className="flex-1 bg-[#3a2a5a] text-white px-4 py-3 rounded-full outline-none placeholder-gray-500 focus:ring-2 focus:ring-[#6b4fd4] transition"
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
  onClick={() => {
    if (selectedFile) {
      handleSend(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      handleSend();
    }
  }}
>

                  {uploadingFile ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}