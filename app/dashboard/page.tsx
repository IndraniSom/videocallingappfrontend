"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Send,
  Camera,
  Users,
  Loader2,
  SkipForward,
  XCircle,
  UserPlus,
} from "lucide-react";
import { useAgoraChat } from "@/hooks/useAgoraChat";
import { useSupabaseChat } from "@/hooks/useSupabaseChat";
import { useFriends } from "@/hooks/useFriends";
import axiosInstance from "@/lib/axiosInstance";

const BackgroundVideo = ({
  videoUrl,
  isActive,
}: {
  videoUrl: string;
  isActive: boolean;
}) => (
  <div
    className={`absolute inset-0 transition-opacity duration-1000 ${
      isActive ? "opacity-75 z-0" : "opacity-0 z-0"
    }`}
  >
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
      src={videoUrl}
    />
    <div className="absolute inset-0 bg-black/40" />
  </div>
);

const Dashboard: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [inVideoChat, setInVideoChat] = useState(false);
  const [searching, setSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isCamOn, setCamOn] = useState(true);
  const [isMicOn, setMicOn] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [preference, setPreference] = useState<"male" | "female" | "both">("both");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const user =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userId = user.id || "";
  const subscriptionType = user.subscriptionType || "free";
  const isPremium = subscriptionType === "premium";

  const {
    joinChannel,
    leaveChannel,
    toggleMic: agoraToggleMic,
    toggleCamera: agoraToggleCamera,
    remoteTracks,
    localVideoTrack,
    joinMatchQueue,
  } = useAgoraChat();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const videoUrls = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  ];

  // 🔹 Supabase Chat Hook
  const { messages, sendMessage } = useSupabaseChat(roomId ?? "", userId);
  
  // 🔹 Friends Hook
  const { sendFriendRequest } = useFriends();

  // Rotate background videos
  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length);
    }, 8000);
    return () => clearInterval(carouselTimer);
  }, [videoUrls.length]);

  // Attach local video
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current)
      localVideoTrack.play(localVideoRef.current);
  }, [localVideoTrack]);

  // Attach remote video
  useEffect(() => {
    if (remoteTracks.video && remoteVideoRef.current)
      remoteTracks.video.play(remoteVideoRef.current);
  }, [remoteTracks.video]);





// inside handleEnterChat
const handleEnterChat = async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please log in first");
  
  // Check premium requirement for gender filters
  if ((preference === "male" || preference === "female") && !isPremium) {
    setShowUpgradeModal(true);
    return;
  }
  
  setSearching(true);
  setStatusMessage("Searching...");

  try {
    let matched = null;
    while (!matched) {
      const res = await joinMatchQueue(token, preference);
      if (res.matched) {
        matched = res;
        break;
      }
      if (res.requiresPremium) {
        setSearching(false);
        setShowUpgradeModal(true);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // retry every 2s
    }

    console.log("✅ Matched:", matched);
    
    // Set roomId and partnerId for chat functionality
    if (matched.roomId) {
      setRoomId(matched.roomId);
    }
    if (matched.other?._id) {
      setPartnerId(matched.other._id);
    }
    
    setInVideoChat(true);
    setStatusMessage("Connecting...");
    await joinChannel(matched.channelName, matched.yourToken, matched.yourAccount);
    setStatusMessage("Connected");
  } catch (err) {
    console.error("Error joining:", err);
    setStatusMessage("Error joining queue.");
  } finally {
    setSearching(false);
  }
};





  const handleEnd = async () => {
    await leaveChannel();
    setInVideoChat(false);
    setStatusMessage("Chat ended.");
    setRoomId(null);
    setPartnerId(null);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
    // Auto-refresh the page after ending the call
    window.location.reload();
  };

  const handleSkip = () => {
    handleEnd();
    handleEnterChat();
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) {
      console.warn("Cannot send empty message");
      return;
    }
    if (!roomId) {
      console.warn("Cannot send message: roomId is missing");
      setStatusMessage("Room ID not set. Please wait...");
      return;
    }
    if (!partnerId) {
      console.warn("Cannot send message: partnerId is missing");
      setStatusMessage("Partner ID not set. Please wait...");
      return;
    }
    try {
      await sendMessage(partnerId, chatInput.trim());
      setChatInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!partnerId) {
      setStatusMessage("Partner ID not available");
      return;
    }
    try {
      await sendFriendRequest(partnerId);
      setStatusMessage("Friend request sent!");
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      if (error.response?.data?.message) {
        setStatusMessage(error.response.data.message);
      } else {
        setStatusMessage("Failed to send friend request");
      }
    }
  };

  // Debugging logs
  useEffect(() => {
    console.log("📊 Chat State:", {
      messages: messages.length,
      roomId,
      partnerId,
      userId,
      inVideoChat
    });
  }, [messages, roomId, partnerId, userId, inVideoChat]);
  
  // Log when roomId is set
  useEffect(() => {
    if (roomId) {
      console.log("✅ RoomId set:", roomId);
    }
  }, [roomId]);
  
  // Log when partnerId is set
  useEffect(() => {
    if (partnerId) {
      console.log("✅ PartnerId set:", partnerId);
    }
  }, [partnerId]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background videos */}
      {videoUrls.map((url, index) => (
        <BackgroundVideo key={index} videoUrl={url} isActive={index === currentVideoIndex} />
      ))}

      {/* Waiting screen */}
      {!inVideoChat && (
        <div className="z-50 flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Start Video Chat</h1>
          <div className="flex gap-3 mb-4">
  <button
    onClick={() => {
      if (!isPremium) {
        setShowUpgradeModal(true);
        return;
      }
      setPreference("male");
    }}
    disabled={!isPremium}
    className={`px-4 py-2 rounded-lg transition-all ${
      preference === "male" ? "bg-blue-600" : "bg-gray-700"
    } ${!isPremium ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500"}`}
    title={!isPremium ? "Premium required" : "Filter by males"}
  >
    Guys {!isPremium && "🔒"}
  </button>
  <button
    onClick={() => {
      if (!isPremium) {
        setShowUpgradeModal(true);
        return;
      }
      setPreference("female");
    }}
    disabled={!isPremium}
    className={`px-4 py-2 rounded-lg transition-all ${
      preference === "female" ? "bg-pink-600" : "bg-gray-700"
    } ${!isPremium ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-500"}`}
    title={!isPremium ? "Premium required" : "Filter by females"}
  >
    Girls {!isPremium && "🔒"}
  </button>
  <button
    onClick={() => setPreference("both")}
    className={`px-4 py-2 rounded-lg transition-all ${
      preference === "both" ? "bg-green-600" : "bg-gray-700"
    } hover:bg-green-500`}
    title="Match with anyone"
  >
    Both
  </button>
</div>

          <button
            onClick={handleEnterChat}
            disabled={searching}
            className={`${
              searching ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105`}
          >
            {searching ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" /> Connecting...
              </span>
            ) : (
              "Enter Video Chat"
            )}
          </button>
          <div className="flex items-center gap-2 mt-4 text-gray-300">
            <Camera className="w-5 h-5" />
            <span>Activate your camera to start searching</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            ⏱ {Math.floor(callDuration / 60)}:
            {(callDuration % 60).toString().padStart(2, "0")}
          </p>
          {statusMessage && (
            <p className="text-gray-300 mt-4">
              <Users className="inline w-4 h-4 mr-1" />
              {statusMessage}
            </p>
          )}
          {role && <p className="text-gray-400 text-sm mt-2">Your role: {role}</p>}
          {!isPremium && (
            <p className="text-yellow-400 text-sm mt-2">
              ⭐ Upgrade to Premium to filter by gender
            </p>
          )}
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upgrade to Premium</h2>
            <p className="text-gray-600 mb-6">
              Premium subscription allows you to filter by specific gender (Guys or Girls) when searching for matches.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Filter by specific gender</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Priority matching</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Unlimited video calls</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/upgrade`);
                    if (res.data) {
                      // Fetch updated profile
                      const profileRes = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);
                      if (profileRes.data.user) {
                        localStorage.setItem("user", JSON.stringify(profileRes.data.user));
                      }
                      setShowUpgradeModal(false);
                      window.location.reload();
                    }
                  } catch (error: any) {
                    console.error("Upgrade error:", error);
                    alert(error.response?.data?.message || "Failed to upgrade. Please try again.");
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Upgrade Now (Free)
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              * Currently free for testing purposes
            </p>
          </div>
        </div>
      )}

      {/* Active chat/call */}
      {inVideoChat && (
        <div className="relative z-50 w-full h-full flex">
          {/* Video section */}
          <div className="flex-1 relative flex items-center justify-center bg-black">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!remoteTracks.video && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60">
                <Users className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-300">
                  {statusMessage || "No users available right now"}
                </p>
              </div>
            )}
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-48 h-36 absolute bottom-6 right-6 rounded-lg border border-white/30 bg-gray-900 object-cover"
            />

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  setCamOn((p) => !p);
                  agoraToggleCamera();
                }}
                className={`p-3 rounded-full transition-all ${
                  isCamOn ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => {
                  setMicOn((p) => !p);
                  agoraToggleMic();
                }}
                className={`p-3 rounded-full transition-all ${
                  isMicOn ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSendFriendRequest}
                className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full"
                title="Send Friend Request"
              >
                <UserPlus className="w-5 h-5" />
              </button>
              <button
                onClick={handleSkip}
                className="p-3 bg-yellow-500 hover:bg-yellow-600 rounded-full"
                title="Skip user"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={handleEnd}
                className="p-3 bg-red-600 hover:bg-red-700 rounded-full"
                title="End Chat"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 h-full bg-gray-900/90 backdrop-blur-md border-l border-white/10 flex flex-col justify-between p-4">
            <div className="flex-1 overflow-y-auto space-y-2">
              {!roomId ? (
                <p className="text-gray-400 text-center mt-4">Waiting for connection...</p>
              ) : Array.isArray(messages) && messages.length > 0 ? (
                messages.map((msg, i) => {
                  const text = msg.message ?? msg.text ?? "";
                  const sender = msg.sender_id ?? msg.senderId ?? "";
                  const currentUserId = userId ?? "";

                  // 🧠 Normalize both IDs
                  const isYou =
                    String(sender).trim().toLowerCase() ===
                    String(currentUserId).trim().toLowerCase();

                  return (
                    <div
                      key={msg.id || i}
                      className={`text-sm p-2 rounded-lg ${
                        isYou 
                          ? "text-blue-400 text-right bg-blue-900/20 ml-auto" 
                          : "text-white text-left bg-gray-800/50 mr-auto"
                      } max-w-[80%]`}
                    >
                      <p className="font-semibold text-xs mb-1">
                        {isYou ? "You" : "Partner"}
                      </p>
                      <p>{text}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-center mt-4">Start chatting...</p>
              )}
            </div>



            {/* Message Input */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                disabled={!roomId || !partnerId}
                className="flex-1 p-2 rounded-lg text-white bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!roomId || !partnerId || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
