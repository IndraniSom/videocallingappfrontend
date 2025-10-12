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
import { useVideoChat } from "@/hooks/useVideoChat";

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
  const {
    role,
    stream,
    remoteStream,
    statusMessage,
    isCamOn,
    isMicOn,
    chatMessages,
    callDuration,
    joinQueue,
    toggleCamera,
    toggleMic,
    sendMessage,
    endChat,
    skipUser,
    requestMediaAccess,
  } = useVideoChat();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [inVideoChat, setInVideoChat] = useState(false);
  const [searching, setSearching] = useState(false);

  const videoUrls = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  ];

  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length);
    }, 8000);
    return () => clearInterval(carouselTimer);
  }, [videoUrls.length]);

  useEffect(() => {
    if (localVideoRef.current && stream)
      localVideoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const handleEnterChat = async () => {
    setSearching(true);
    const granted = await requestMediaAccess();
    if (granted) {
      setInVideoChat(true);
      joinQueue();
    } else {
      alert("Camera and microphone permissions are required to continue.");
      setSearching(false);
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput("");
    }
  };

  const handleSkip = () => {
    skipUser();
  };

  const handleEnd = () => {
    endChat();
    setInVideoChat(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background */}
      {videoUrls.map((url, index) => (
        <BackgroundVideo
          key={index}
          videoUrl={url}
          isActive={index === currentVideoIndex}
        />
      ))}

      {/* Before entering chat */}
      {!inVideoChat && (
        <div className="z-50 flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Start Video Chat
          </h1>
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
            <p className="text-gray-300 text-sm">
  ⏱ {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}
</p>

          {statusMessage && (
            <p className="text-gray-300 mt-4">
              <Users className="inline w-4 h-4 mr-1" />
              {statusMessage}
            </p>
          )}

          {role && (
            <p className="text-gray-400 text-sm mt-2">Your role: {role}</p>
          )}
        </div>
      )}

      {/* Inside video chat mode */}
      {inVideoChat && (
        <div className="relative z-50 w-full h-full flex flex-col md:flex-row">
          {/* Video area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
            <div className="relative flex gap-6 items-center justify-center">
              {/* Remote user video */}
              <div className="relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-[500px] h-[360px] rounded-xl border border-white/30 bg-gray-800 object-cover"
                />
                {!remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60 rounded-xl">
                    <Users className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-gray-300">
                      {statusMessage || "No users available right now"}
                    </p>
                  </div>
                )}
              </div>

              {/* Local video (self preview) */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-48 h-36 absolute bottom-6 right-6 rounded-lg border border-white/30 bg-gray-900 object-cover"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full transition-all ${
                  isCamOn ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {isCamOn ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleMic}
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

          {/* Chat panel */}
          <div className="w-full md:w-80 bg-gray-900/90 backdrop-blur-md border-l border-white/10 flex flex-col justify-between p-4">
            <div className="flex-1 overflow-y-auto space-y-2">
              {chatMessages.length === 0 ? (
                <p className="text-gray-400 text-center mt-4">
                  Start chatting...
                </p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm ${
                      msg.from === "You" ? "text-blue-400" : "text-white"
                    }`}
                  >
                    <span className="font-semibold">{msg.from}:</span>{" "}
                    <span>{msg.text}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded-lg text-white"
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
