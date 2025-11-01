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
} from "lucide-react";
import { useAgoraChat } from "@/hooks/useAgoraChat";
import { useSupabaseChat } from "@/hooks/useSupabaseChat";

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

  const user =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userId = user.id || "";

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

  // Start matchmaking & join video
  const handleEnterChat = async () => {
    setSearching(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first.");
        setSearching(false);
        return;
      }

      const res = await joinMatchQueue(token);
      console.log("Matched:", res);

      if (res.matched) {
        setInVideoChat(true);
        setRole(res.role || "user");
        setStatusMessage("Connecting...");
        setRoomId(res.roomId);
        setPartnerId(res.other?._id || null);

        await joinChannel(res.channelName, res.yourToken, res.yourAccount);

        // Start call timer
        setCallDuration(0);
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        callTimerRef.current = setInterval(
          () => setCallDuration((p) => p + 1),
          1000
        );
      } else {
        setStatusMessage("Waiting for a match...");
      }
    } catch (err) {
      console.error("Join error:", err);
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
    if (!chatInput.trim() || !roomId || !partnerId) return;
    await sendMessage(partnerId, chatInput.trim());
    setChatInput("");
  };

  // Debugging logs
  useEffect(() => {
    console.log("Messages in sidebar:", messages);
    console.log("RoomId:", roomId);
    console.log("UserId:", userId);
  }, [messages, roomId]);

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
  {Array.isArray(messages) && messages.length > 0 ? (
    messages.map((msg, i) => {
      const text = msg.message ?? msg.text ?? "";
      const sender = msg.sender_id ?? msg.senderId ?? "";
      const currentUserId = userId ?? "";

      // 🧠 Normalize both IDs
      const isYou =
        String(sender).trim().toLowerCase() ===
        String(currentUserId).trim().toLowerCase();

      console.log(
        `[${i}] sender:`,
        sender,
        "| currentUserId:",
        currentUserId,
        "| isYou:",
        isYou
      );

      return (
        <div
          key={msg.id || i}
          className={`text-sm ${
            isYou ? "text-blue-400 text-right" : "text-white text-left"
          }`}
        >
          <p>
            <span className="font-semibold">
              {isYou ? "You" : "Partner"}:
            </span>{" "}
            {text}
          </p>
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
                placeholder="Type a message..."
                className="flex-1 p-2 rounded-lg text-white bg-gray-800 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg"
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
