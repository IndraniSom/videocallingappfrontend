"use client";
  import React, { useEffect, useRef, useState } from "react";
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

  const Dashboard: React.FC = () => {
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

    const [user, setUser] = useState<any>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
      if (typeof window !== "undefined") {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(storedUser);
      }
    }, []);
    const userId = user?.id ?? "";
    const subscriptionType = user?.subscriptionType ?? "free";
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

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const { messages, sendMessage } = useSupabaseChat(roomId ?? "", userId);
    const { sendFriendRequest } = useFriends();

    // Enable camera on component mount
    useEffect(() => {
      const enableCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("⚠ Camera access denied or error:", error);
        }
      };

      enableCamera();

      return () => {
        // Cleanup: stop all tracks when component unmounts
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }, []);

    useEffect(() => {
      if (localVideoTrack && localVideoRef.current) localVideoTrack.play(localVideoRef.current);
    }, [localVideoTrack]);

    useEffect(() => {
      if (remoteTracks.video && remoteVideoRef.current) remoteTracks.video.play(remoteVideoRef.current);
    }, [remoteTracks.video]);

    const handleEnterChat = async () => {
      if (!mounted) return;
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in first");

      if ((preference === "male" || preference === "female") && !isPremium) {
        setShowUpgradeModal(true);
        return;
      }

      setSearching(true);
      setStatusMessage("Searching...");

      try {
        let matched = null as any;
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
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        if (matched.roomId) setRoomId(matched.roomId);
        if (matched.other?._id) setPartnerId(matched.other._id);

        setInVideoChat(true);
        setStatusMessage("Connecting...");
        await joinChannel(matched.channelName, matched.yourToken, matched.yourAccount);
        // setStatusMessage("Connected");
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
      window.location.reload();
    };

    const handleSkip = () => {
      handleEnd();
      handleEnterChat();
    };

    const handleSendMessage = async () => {
      if (!chatInput.trim()) return;
      if (!roomId) {
        setStatusMessage("Room ID not set. Please wait...");
        return;
      }
      if (!partnerId) {
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
        if (error.response?.data?.message) setStatusMessage(error.response.data.message);
        else setStatusMessage("Failed to send friend request");
      }
    };

    useEffect(() => {
      console.log("📊 Chat State:", { messages: messages.length, roomId, partnerId, userId, inVideoChat });
    }, [messages, roomId, partnerId, userId, inVideoChat]);

    return (
      <div className="w-full h-full md:h-screen bg-[#5940df] flex items-center justify-center ">
      <div className="w-full max-w-5xl bg-[#654bf1] -mt-20 px-2 pt-2 rounded-lg flex flex-col md:flex-row gap-5 shadow-lg">
        {/* Left column: local video + controls + pre-chat UI */}
        <div className="md:w-1/2 w-full flex flex-col items-center gap-6 rounded-2xl mt-16 md:mt-0">
          

          {/* Local video preview with controls in top right corner */}
          <div className="w-full max-w-[600px] flex-1 h-full flex items-center justify-center rounded-2xl relative">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-[500px] object-cover bg-gray-800 rounded-2xl" />
            
            {/* Controls positioned in top right corner (only visible when in a call) */}
            {inVideoChat && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full">
                {/* <button onClick={() => { setCamOn((p) => !p); agoraToggleCamera(); }} className={`p-2 rounded-full transition-all ${isCamOn ? "bg-green-600" : "bg-red-600"}`} title={isCamOn ? "Turn off camera" : "Turn on camera"}>
                  {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button onClick={() => { setMicOn((p) => !p); agoraToggleMic(); }} className={`p-2 rounded-full transition-all ${isMicOn ? "bg-green-600" : "bg-red-600"}`} title={isMicOn ? "Mute microphone" : "Unmute microphone"}>
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button> */}
                <button onClick={handleSendFriendRequest} className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full" title="Send Friend Request"><UserPlus className="w-4 h-4" /></button>
                <button onClick={handleSkip} className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full" title="Skip user"><SkipForward className="w-4 h-4" /></button>
                <button onClick={handleEnd} className="p-2 bg-red-600 hover:bg-red-700 rounded-full" title="End Chat"><XCircle className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Preferences & Enter button */}
          <div className="w-full">
            

            {/* <div className="text-center text-sm text-gray-300 mb-2">
              <Camera className="inline-block w-4 h-4 mr-1" /> Activate your camera to start searching
            </div> */}

            {/* <div className="text-center text-sm text-gray-300">⏱ {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}</div>

            {statusMessage && (
              <p className="text-gray-300 mt-3 text-center">
                <Users className="inline w-4 h-4 mr-1" /> {statusMessage}
              </p>
            )}

            {role && <p className="text-gray-400 text-sm mt-2 text-center">Your role: {role}</p>}
            {!isPremium && <p className="text-yellow-400 text-sm mt-2 text-center">⭐ Upgrade to Premium to filter by gender</p>} */}
          </div>

          
        </div>

        {/* Right column: remote video + chat */}
         {!inVideoChat && (
          <div className="md:w-1/2 w-full max-w-[600px] bg-gradient-to-b from-[#6b4fd4] to-[#5940df] h-[500px] flex flex-col justify-between items-center rounded-3xl p-8">
            {/* Connect With Section */}
            <div className="w-full">
              <p className="text-white text-lg font-semibold mb-6">Connect With</p>
              <div className="flex gap-6 justify-center items-center">
                {/* Male Button */}
                <button
                  onClick={() => {
                    setShowUpgradeModal(true);
                    if (isPremium) setPreference("male");
                  }}
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl transition-all duration-300 ${
                    preference === "male"
                      ? "bg-blue-600 border-2 border-blue-400 shadow-lg shadow-blue-500"
                      : "bg-[#4a3a7a] hover:bg-[#5a4a8a] border-2 border-transparent"
                  }`}
                  title="Filter by males"
                >
                  <div className="text-4xl mb-2">♂</div>
                  <span className="text-white text-sm font-semibold">Male</span>
                </button>

                {/* Female Button */}
                <button
                  onClick={() => {
                    setShowUpgradeModal(true);
                    if (isPremium) setPreference("female");
                  }}
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl transition-all duration-300 ${
                    preference === "female"
                      ? "bg-pink-600 border-2 border-pink-400 shadow-lg shadow-pink-500"
                      : "bg-[#4a3a7a] hover:bg-[#5a4a8a] border-2 border-transparent"
                  }`}
                  title="Filter by females"
                >
                  <div className="text-4xl mb-2">♀</div>
                  <span className="text-white text-sm font-semibold">Female</span>
                </button>

                {/* Both Button */}
                <button
                  onClick={() => setPreference("both")}
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl transition-all duration-300 ${
                    preference === "both"
                      ? "bg-gradient-to-br from-blue-500 to-pink-500 border-2 border-cyan-400 shadow-lg shadow-cyan-500"
                      : "bg-[#4a3a7a] hover:bg-[#5a4a8a] border-2 border-[#7a6aaa]"
                  }`}
                  title="Match with anyone"
                >
                  <div className="text-4xl mb-2">⚤</div>
                  <span className="text-white text-sm font-semibold">Both</span>
                </button>
              </div>
            </div>

            {/* Start Video Chat Button */}
            <div className="w-full flex flex-col items-center gap-3">
              <button
                onClick={handleEnterChat}
                disabled={searching}
                className={`w-full max-w-xs py-4 px-8 font-bold text-lg transition-all duration-300 ${
                  searching
                    ? "bg-[#fffc01] cursor-wait"
                    : " hover:shadow-lg "
                } text-black rounded-md flex items-center justify-center gap-2 bg-[#fffc01]`}
              >
                {searching ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  "Start Video Chat"
                )}
              </button>
              <p className="text-xs text-gray-200 text-center">By starting, you agree to our Terms of Service.</p>
            </div>
          </div>
         )}
         {inVideoChat && (
        <div className=" w-full h-full flex md:flex-row flex-col">
        
          <div className="w-full max-w-[600px] h-[500px] relative bg-[#5940df] flex items-center justify-center">
            {/* Remote video area */}
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-[500px] rounded-lg object-cover" />

            {!remoteTracks.video && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60">
                <Users className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-300">{inVideoChat ? statusMessage || "Waiting for partner..." : "No active call"}</p>
              </div>
            )}
          </div>

          {/* Chat area below remote video */}
          <div className="w-full h-[500px] ml-0 md:ml-5 rounded-2xl overflow-y-auto overflow-x-hidden bg-gray-900/90 backdrop-blur-md border-t border-white/10 flex flex-col justify-between p-4">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 overflow-x-hidden">
              {!roomId ? (
                <p className="text-gray-400 text-center mt-4">Waiting for connection...</p>
              ) : Array.isArray(messages) && messages.length > 0 ? (
                messages.map((msg, i) => {
                  const text = msg.message ?? msg.text ?? "";
                  const sender = msg.sender_id ?? msg.senderId ?? "";
                  const currentUserId = userId ?? "";
                  const isYou = String(sender).trim().toLowerCase() === String(currentUserId).trim().toLowerCase();

                  return (
                    <div
  key={msg.id || i}
  className={`text-sm p-2 rounded-lg ${
    isYou
      ? "text-blue-400 text-right bg-blue-900/20 ml-auto"
      : "text-white text-left bg-gray-800/50 mr-auto"
  } max-w-[80%] break-words whitespace-normal`}
>
  <p className="font-semibold text-xs mb-1">{isYou ? "You" : "Partner"}</p>
  <p className="break-words whitespace-normal">{text}</p>
</div>

                  );
                })
              ) : (
                <p className="text-gray-400 text-center mt-4">Start chatting...</p>
              )}
            </div>

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
              <button onClick={handleSendMessage} disabled={!roomId || !partnerId || !chatInput.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        </div>)}

        {/* Upgrade Modal (fixed overlay) */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-[#5940df]/50 flex items-center justify-center z-50">
            <div className="bg-[#5940df] rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Upgrade to Premium</h2>
              <p className="text-gray-600 mb-6">Premium subscription allows you to filter by specific gender (Guys or Girls) when searching for matches.</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Filter by specific gender</span></div>
                <div className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Priority matching</span></div>
                <div className="flex items-center gap-2"><span className="text-green-500">✓</span><span>Unlimited video calls</span></div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/upgrade`);
                      if (res.data) {
                        const profileRes = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);
                        if (profileRes.data.user) localStorage.setItem("user", JSON.stringify(profileRes.data.user));
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
                <button onClick={() => setShowUpgradeModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold">Cancel</button>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">* Currently free for testing purposes</p>
            </div>
          </div>
        )}
      </div>
      </div>
    );
  };

  export default Dashboard;