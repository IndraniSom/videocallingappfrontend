"use client";
  import React, { useEffect, useRef, useState } from "react";
  import dynamic from "next/dynamic";

  import {
    Send,
    Camera,
    Users,
    Loader2,
    SkipForward,
    XCircle,
    UserPlus,
    MessageCircle,
    Flag,
  } from "lucide-react";

  import { useAgoraChat } from "@/hooks/useAgoraChat";
  import { useSupabaseChat } from "@/hooks/useSupabaseChat";
  import { useFriends } from "@/hooks/useFriends";
  import axiosInstance from "@/lib/axiosInstance";
  import Image from "next/image";
  import toast from "react-hot-toast";
  import { useTranslation } from "react-i18next";

  const DotLottieReact = dynamic(
    () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
    { ssr: false }
  );

  const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const [chatInput, setChatInput] = useState("");
    const [inVideoChat, setInVideoChat] = useState(false);
    const [searching, setSearching] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const [isCamOn, setCamOn] = useState(true);
    const [isMicOn, setMicOn] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [callId, setCallId] = useState<string | null>(null);
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState<number>(0);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [preference, setPreference] = useState<"male" | "female" | "both">("both");
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [mediaReady, setMediaReady] = useState(false);

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
    const localCallVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteCallVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteDesktopVideoRef = useRef<HTMLVideoElement | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);

    const { messages, sendMessage } = useSupabaseChat(roomId ?? "", userId);
    const { friends, sendFriendRequest, fetchFriends } = useFriends();
    const [partnerName, setPartnerName] = useState<string>("");
    const [showChatOverlay, setShowChatOverlay] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const isFriendAccepted = Array.isArray(friends)
      ? friends.some((f: any) => {
          const fid = f?.user?._id || f?.user?.id;
          return String(fid) === String(partnerId) && f?.status === "accepted";
        })
      : false;

    const isLocalCameraTrackEnabled =
      !!localStreamRef.current?.getVideoTracks?.().some((t) => t.enabled);

    const showLocalPlaceholder = !mediaReady || !isCamOn || !isLocalCameraTrackEnabled;

    const requestMedia = async (): Promise<boolean> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });
        localStreamRef.current = stream;
        setMediaReady(true);
        setShowPermissionModal(false);

        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        if (localCallVideoRef.current) localCallVideoRef.current.srcObject = stream;

        return true;
      } catch (e) {
        setMediaReady(false);
        setShowPermissionModal(true);
        return false;
      }
    };

    useEffect(() => {
      if (!mounted) return;
      if (mediaReady) return;
      requestMedia();
    }, [mounted]);

    useEffect(() => {
      return () => {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }, []);

    useEffect(() => {
      if (!localVideoTrack) return;
      const target = inVideoChat ? localCallVideoRef.current : localVideoRef.current;
      if (target) localVideoTrack.play(target);
    }, [localVideoTrack, inVideoChat]);

    useEffect(() => {
      if (!mounted) return;
      const mq = window.matchMedia("(min-width: 768px)");
      const update = () => setIsDesktop(mq.matches);
      update();
      mq.addEventListener?.("change", update);
      return () => mq.removeEventListener?.("change", update);
    }, [mounted]);

    useEffect(() => {
      const track = remoteTracks.video;
      if (!track) return;
      const target = isDesktop ? remoteDesktopVideoRef.current : remoteCallVideoRef.current;
      if (target) track.play(target);
    }, [remoteTracks.video, isDesktop]);

    const handleEnterChat = async () => {
      if (!mounted) return;
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(t("please_log_in_first"));
        return;
      }

      if (!mediaReady) {
        const ok = await requestMedia();
        if (!ok) return;
      }

      if ((preference === "male" || preference === "female") && !isPremium) {
        setShowUpgradeModal(true);
        return;
      }

      setSearching(true);
      setStatusMessage(t("searching"));

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
        if (matched.callId) setCallId(String(matched.callId));
        if (matched.other?._id) setPartnerId(matched.other._id);
        if (matched.other?.name) setPartnerName(matched.other.name);
        else if (matched.other?.firstName) setPartnerName(matched.other.firstName);
        setInVideoChat(true);
        localStorage.setItem(
  "activeCall",
  JSON.stringify({
    roomId: matched.roomId,
    callId: matched.callId,
  })
);

        setStatusMessage(t("connecting"));
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
      try {
        if (roomId && callId) {
          await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}c`, { roomId, callId });
        }
      } catch (e) {
        // best-effort; still leave channel + reset UI
        console.error("Failed to end call on server", e);
      }
      localStorage.removeItem("activeCall");

      await leaveChannel();
      setInVideoChat(false);
      setStatusMessage(t("chat_ended"));
      setRoomId(null);
      setCallId(null);
      setPartnerId(null);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
      toast.success(t("chat_ended"));
      setTimeout(() => {
        window.location.reload();
      }, 300);
    };

    const handleSkip = () => {
      handleEnd();
      handleEnterChat();
    };

    const handleSendMessage = async () => {
      if (!chatInput.trim()) return;
      if (!roomId) {
        setStatusMessage(t("room_id_not_set"));
        return;
      }
      if (!partnerId) {
        setStatusMessage(t("partner_id_not_set"));
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
        setStatusMessage(t("partner_id_not_available"));
        return;
      }
      try {
        await sendFriendRequest(partnerId);
        await fetchFriends();
        setStatusMessage(t("friend_request_sent"));
        toast.success(t("friend_request_sent"));
      } catch (error: any) {
        console.error("Error sending friend request:", error);
        if (error.response?.data?.message) setStatusMessage(error.response.data.message);
        else setStatusMessage(t("failed_to_send_friend_request"));
        toast.error(error.response?.data?.message || t("failed_to_send_friend_request"));
      }
    };

    const handleReportUser = async () => {
      toast.success(t("user_reported"));
    };

    useEffect(() => {
      console.log("📊 Chat State:", { messages: messages.length, roomId, partnerId, userId, inVideoChat });
    }, [messages, roomId, partnerId, userId, inVideoChat]);
    // 🔥 Auto-disconnect if partner leaves
useEffect(() => {
  if (!roomId || !callId) return;

  const timer = setInterval(async () => {
    try {
      const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/call/status`, { callId });
      if (res.data.ended) {
        handleEnd();
      }
    } catch (err) {
      console.log("status error", err);
    }
  }, 2000); // checks every 2 seconds

  return () => clearInterval(timer);
}, [roomId, callId]);

    return (
      <div className="w-full h-screen bg-[#5940df] flex items-center justify-center ">
        {showPermissionModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t("allow_camera_microphone")}</h2>
              <p className="text-gray-600 mb-5">{t("allow_camera_microphone_desc")}</p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await requestMedia();
                  }}
                  className="flex-1 bg-[#fffc01] text-black font-bold py-3 rounded-lg"
                >
                  {t("allow")}
                </button>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg"
                >
                  {t("cancel")}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                If you previously blocked permissions, enable them from your browser site settings.
              </p>
            </div>
          </div>
        )}

        <div className="w-full max-w-7xl bg-[#654bf1] -mt-20 px-2 pt-2 rounded-lg flex flex-col md:flex-row gap-5 shadow-lg">
          {/* Left column (desktop): local preview + controls */}
          <div className={`${inVideoChat ? "hidden md:flex" : "flex"} md:w-1/2 w-full flex-col items-center gap-6 rounded-2xl mt-16 md:mt-0`}>
            <div className="w-full max-w-[800px] h-full flex items-center justify-center rounded-2xl relative">
              <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-[500px] object-cover bg-gray-800 rounded-2xl ${showLocalPlaceholder ? "opacity-0" : "opacity-100"}`} />

              {showLocalPlaceholder && (
                <div className="absolute inset-0 flex items-center justify-center bg-black rounded-2xl">
                  <div className=" flex flex-col gap-3 items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera-off-icon lucide-camera-off"><path d="M14.564 14.558a3 3 0 1 1-4.122-4.121"/><path d="m2 2 20 20"/><path d="M20 20H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 .819-.175"/><path d="M9.695 4.024A2 2 0 0 1 10.004 4h3.993a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v7.344"/></svg>
                    <p className=" text-white/80 text-lg max-w-2xl text-center px-4">
                      {mediaReady ? "Camera is off" : "With You on camera, it's easier to meet the right one."}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 right-2 text-[#fffc01] text-lg tracking-wide z-20"> </div>

              {!inVideoChat && (
                <div className="md:hidden absolute inset-x-3 bottom-3 z-30">
                  <button
                    onClick={handleEnterChat}
                    disabled={searching}
                    className={`w-full py-4 px-6 font-bold text-lg transition-all duration-300 text-black rounded-xl flex items-center justify-center gap-2 bg-[#fffc01] shadow-lg ${
                      searching ? "cursor-wait opacity-80" : "hover:shadow-[0_0_25px_rgba(255,235,59,0.45)]"
                    }`}
                  >
                    {searching ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span />
                      </>
                    ) : (
                      t("start_video_chat")
                    )}
                  </button>
                  <p className="mt-2 text-[11px] text-white/80 text-center">{t("terms_agree")}</p>
                </div>
              )}
            </div>

            <div className="w-full" />
          </div>

          {/* Right column: pre-call OR in-call */}
          {!inVideoChat && (
            <div className="md:w-1/2 w-full max-w-[600px] bg-gradient-to-b from-[#6b4fd4] to-[#5940df] h-[500px] hidden md:flex flex-col justify-center gap-5 items-center rounded-3xl p-8">
             <div className="w-full flex flex-col justify-center items-center">
              <Image src='/buttonspace.svg' alt='' height={120} width={120} className="object-cover "/>
               <div className="w-full">
                <p className="text-white text-4xl font-semibold mb-6 text-center mt-3">CamKind</p>
              </div>
               <div className="w-full">
                <p className="text-white text-xl mb-6 text-center -ml-3">Talk With Strangers and make new friends <br/> face to face </p>
              </div>
              </div>
              <div className="w-full md:flex hidden flex-col items-center gap-3">
                <button
                  onClick={handleEnterChat}
                  disabled={searching}
                  className={`w-full max-w-xs py-4 px-8 font-bold text-lg transition-all duration-300 ${
                    searching ? "bg-[#fffc01] cursor-wait" : " hover:shadow-lg "
                  } text-black rounded-md flex items-center justify-center gap-2 bg-[#fffc01]`}
                >
                  {searching ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span />
                    </>
                  ) : (
                    t("start_video_chat")
                  )}
                </button>
                <p className="text-xs text-gray-200 text-center">{t("terms_agree")}</p>
              </div>
            </div>
          )}

          {inVideoChat && (
            <div className="w-full h-full flex flex-col md:flex-row">
              {/* Mobile: remote(top) + local(bottom) */}
              <div className="relative w-full md:hidden bg-[#5940df] rounded-lg overflow-hidden">
                <div className="relative w-full h-[260px]">
                  <video ref={remoteCallVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

                  {partnerName && (
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-sm z-20">
                      {partnerName}
                    </div>
                  )}

                  <button
                    onClick={handleReportUser}
                    className="absolute top-3 right-3 z-50 p-2 bg-red-600/80 hover:bg-red-700 rounded-full"
                    title="Report"
                  >
                    <Flag className="w-4 h-4 text-white" />
                  </button>

                  <div className="absolute bottom-3 left-3 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full">
                    {isFriendAccepted ? (
                      <span className="px-3 py-2 rounded-full bg-green-600/30 text-green-200 text-xs font-semibold">
                        Friends
                      </span>
                    ) : (
                      <button onClick={handleSendFriendRequest} className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full" title="Send Friend Request"><UserPlus className="w-4 h-4" /></button>
                    )}
                    <button onClick={handleSkip} className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full" title="Skip user"><SkipForward className="w-4 h-4" /></button>
                    <button onClick={handleEnd} className="p-2 bg-red-600 hover:bg-red-700 rounded-full" title="End Chat"><XCircle className="w-4 h-4" /></button>
                  </div>

                  <div className="absolute bottom-2 right-2 text-[#fffc01] text-lg tracking-wide z-20">
                    <Image src='/watermark.svg' alt='' height={120} width={160} className="object-cover opacity-50"/>
                  </div>

                  {!remoteTracks.video && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60 z-10">
                      <DotLottieReact src="/loader.lottie" loop autoplay style={{ width: 120, height: 120 }} />
                      <p className="text-gray-300 mt-2">{statusMessage || t("connecting")}</p>
                    </div>
                  )}
                </div>

                <div className="relative w-full h-[240px] border-t border-white/10">
                  <video ref={localCallVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${showLocalPlaceholder ? "opacity-0" : "opacity-100"}`} />

                  {showLocalPlaceholder && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <DotLottieReact src="/loading.lottie" loop autoplay style={{ width: 120, height: 120 }} />
                    </div>
                  )}
                  <button
                    onClick={() => setShowChatOverlay((p) => !p)}
                    className="absolute bottom-3 right-3 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full"
                    title="Toggle chat"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                  </button>

                  {showChatOverlay && (
                    <div className="absolute left-3 right-3 bottom-14 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col overflow-hidden z-30 max-h-[220px]">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                        <p className="text-white text-sm font-semibold">{t("chat")}</p>
                        <button onClick={() => setShowChatOverlay(false)} className="text-white/80 hover:text-white text-sm">{t("close")}</button>
                      </div>

                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 p-3">
                        {!roomId ? (
                          <p className="text-gray-300 text-center mt-2">{t("waiting_for_connection")}</p>
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
                                  isYou ? "text-blue-400 text-right bg-blue-900/20 ml-auto" : "text-white text-left bg-gray-800/50 mr-auto"
                                } max-w-[85%] break-words whitespace-normal`}
                              >
                                <p className="font-semibold text-xs mb-1">{isYou ? t("you") : t("partner")}</p>
                                <p className="break-words whitespace-normal">{text}</p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-300 text-center mt-2">{t("start_chatting")}</p>
                        )}
                      </div>

                      <div className="flex gap-2 p-3 border-t border-white/10">
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
                          placeholder={t("type_a_message")}
                          disabled={!roomId || !partnerId}
                          className="flex-1 p-2 rounded-lg text-white bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />

                        <button onClick={handleSendMessage} disabled={!roomId || !partnerId || !chatInput.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop: remote + chat */}
              <div className="hidden md:flex w-full h-full md:flex-row flex-col">
                <div className="w-full max-w-[600px] h-[500px] relative bg-[#5940df] flex items-center justify-center">
                  <video ref={remoteDesktopVideoRef} autoPlay playsInline className="w-full h-[500px] rounded-lg object-cover" />
                  {partnerName && (
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-sm z-20">
                      {partnerName}
                    </div>
                  )}

                  <button
                    onClick={handleReportUser}
                    className="absolute top-4 right-4 z-50 p-2 bg-red-600/80 hover:bg-red-700 rounded-full"
                    title="Report"
                  >
                    <Flag className="w-4 h-4 text-white" />
                  </button>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full z-50">
                    <button onClick={handleSendFriendRequest} className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full" title="Send Friend Request"><UserPlus className="w-4 h-4" /></button>
                    <button onClick={handleSkip} className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full" title="Skip user"><SkipForward className="w-4 h-4" /></button>
                    <button onClick={handleEnd} className="p-2 bg-red-600 hover:bg-red-700 rounded-full" title="End Chat"><XCircle className="w-4 h-4" /></button>
                  </div>

                  <div className="absolute bottom-2 right-2 text-[#fffc01] text-lg tracking-wide z-20"> <Image src='/watermark.svg' alt='' height={200} width={240} className="object-cover -mb-4 opacity-50"/>  </div>
                  {!remoteTracks.video && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60">
                      <DotLottieReact src="/loader.lottie" loop autoplay style={{ width: 400, height: 400 }} />
                      {/* <DotLottieReact src="/loading.lottie" loop autoplay style={{ width: 140, height: 140 }} /> */}
                      {/* <p className="text-gray-300 mt-2">{inVideoChat ? statusMessage || "Connecting..." : "No active call"}</p> */}
                    </div>
                  )}
                </div>

                <div className="w-full h-[500px] ml-0 md:ml-5 rounded-2xl overflow-y-auto overflow-x-hidden bg-gray-900/90 backdrop-blur-md border-t border-white/10 flex flex-col justify-between p-4">
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 overflow-x-hidden">
                    {!roomId ? (
                      <p className="text-gray-400 text-center mt-4">{t("waiting_for_connection")}</p>
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
                              isYou ? "text-blue-400 text-right bg-blue-900/20 ml-auto" : "text-white text-left bg-gray-800/50 mr-auto"
                            } max-w-[80%] break-words whitespace-normal`}
                          >
                            <p className="font-semibold text-xs mb-1">{isYou ? t("you") : t("partner")}</p>
                            <p className="break-words whitespace-normal">{text}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 text-center mt-4">{t("start_chatting")}</p>
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
                      placeholder={t("type_a_message")}
                      disabled={!roomId || !partnerId}
                      className="flex-1 p-2 rounded-lg text-white bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <button onClick={handleSendMessage} disabled={!roomId || !partnerId || !chatInput.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
                        toast.success("Upgraded to Premium successfully!");
                      }
                    } catch (error: any) {
                      console.error("Upgrade error:", error);
                      toast.error(error.response?.data?.message || "Failed to upgrade. Please try again.");
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
    );
  };

  export default Dashboard;