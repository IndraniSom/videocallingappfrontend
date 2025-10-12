"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {jwtDecode} from "jwt-decode"; // <- fixed import

interface DecodedToken {
  id: string;
  role?: string;
  email?: string;
}

const SERVER_URL = "http://localhost:5000";

export function useVideoChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Waiting...");
  const [isCamOn, setCamOn] = useState(true);
  const [isMicOn, setMicOn] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string }[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep a ref to pending ICE candidates for the current PC
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // -------------------
  // End chat / cleanup
  // -------------------
  const endChat = useCallback(
    (notify = true) => {
      try {
        if (peerConnection) {
          // remove tracks and close
          try {
            peerConnection.getSenders().forEach((s) => {
              if (s.track) s.track.stop();
            });
          } catch {}
          peerConnection.ontrack = null;
          peerConnection.onicecandidate = null;
          peerConnection.onconnectionstatechange = null;
          try {
            peerConnection.close();
          } catch {}
        }
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        console.warn("endChat cleanup error", err);
      } finally {
        setPeerConnection(null);
        setStream(null);
        setRemoteStream(null);
        pendingCandidatesRef.current = [];
        if (notify && socket && roomId) socket.emit("end_call", { roomId });
        setRoomId(null);
      }
    },
    [peerConnection, socket, roomId, stream]
  );

  // -------------------
  // Connect socket (initial)
  // -------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    let decoded: DecodedToken | null = null;
    try {
      decoded = jwtDecode<DecodedToken>(token);
    } catch (err) {
      console.warn("Invalid token for socket auth", err);
    }
    setRole(decoded?.role || "unknown");

    const s = io(SERVER_URL, { auth: { token } });
    setSocket(s);

    // Basic server events
    const waitingHandler = (data: any) => setStatusMessage(data?.message || "Waiting...");
    const chatHandler = (msg: any) =>
      setChatMessages((prev) => [...prev, { from: msg.from?.name || "Partner", text: msg.text }]);
    const callEndedHandler = () => {
      endChat();
      setStatusMessage("Chat ended.");
    };

    s.on("waiting_status", waitingHandler);
    s.on("chat_message", chatHandler);
    s.on("call_ended", callEndedHandler);

    // remote_toggle_media handled in separate effect (depends on remoteStream)

    return () => {
      s.off("waiting_status", waitingHandler);
      s.off("chat_message", chatHandler);
      s.off("call_ended", callEndedHandler);
      s.disconnect();
    };
    // intentionally not including endChat in deps to avoid re-subscribing; endChat is stable (useCallback)
  }, []);

  // -------------------
  // requestMediaAccess (get user media)
  // -------------------
  const requestMediaAccess = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // ensure local stream tracks are enabled initially
      localStream.getVideoTracks().forEach((t) => (t.enabled = true));
      localStream.getAudioTracks().forEach((t) => (t.enabled = true));
      setStream(localStream);
      setCamOn(localStream.getVideoTracks().length > 0 ? localStream.getVideoTracks()[0].enabled : false);
      setMicOn(localStream.getAudioTracks().length > 0 ? localStream.getAudioTracks()[0].enabled : false);
      return true;
    } catch (err) {
      console.warn("Media access denied or error:", err);
      return false;
    }
  }, []);

  // -------------------
  // join queue
  // -------------------
  const joinQueue = useCallback(() => {
    if (!socket) return;
    socket.emit("join_queue", null, (res: any) => {
      setStatusMessage(res?.message || "Waiting...");
    });
  }, [socket]);

  // -------------------
  // setupPeerConnection (robust)
  // -------------------
  const setupPeerConnection = useCallback(
    (rid: string, isCaller: boolean) => {
      if (!socket) {
        console.warn("No socket in setupPeerConnection");
        return;
      }

      // Clean any existing peer and pending candidates
      if (peerConnection) {
        try {
          peerConnection.close();
        } catch {}
        pendingCandidatesRef.current = [];
        setPeerConnection(null);
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:relay1.expressturn.com:3478",
            username: "efree",
            credential: "free",
          },
        ],
      });

      // store current room
      setRoomId(rid);
      pendingCandidatesRef.current = [];

      // Add local tracks in fixed order (video then audio)
      if (stream) {
        try {
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();
          videoTracks.forEach((t) => pc.addTrack(t, stream));
          audioTracks.forEach((t) => pc.addTrack(t, stream));
        } catch (err) {
          console.warn("Error adding local tracks to pc:", err);
        }
      } else {
        // It's safer to log if stream is missing
        console.warn("setupPeerConnection called without local stream ready");
      }

      // Remote stream creation
      const remote = new MediaStream();
      setRemoteStream(remote);
      pc.ontrack = (event) => {
        try {
          const incoming = event.streams && event.streams[0];
          if (incoming) {
            incoming.getTracks().forEach((t) => remote.addTrack(t));
          }
        } catch (err) {
          console.warn("ontrack error:", err);
        }
      };

      // send ICE
      pc.onicecandidate = (evt) => {
        if (evt.candidate) {
          socket.emit("ice_candidate", { roomId: rid, candidate: evt.candidate });
        }
      };

      // Handler functions so we can remove them later
      const onRemoteIce = async (data: any) => {
        if (!data?.candidate) return;
        const cand = new RTCIceCandidate(data.candidate);
        if (!pc.remoteDescription || !pc.remoteDescription.type) {
          pendingCandidatesRef.current.push(data.candidate);
        } else {
          try {
            await pc.addIceCandidate(cand);
          } catch (err) {
            console.warn("Error adding remote ICE candidate:", err);
          }
        }
      };

      const onSignal = async (data: any) => {
        if (!data?.description) return;
        const desc = new RTCSessionDescription(data.description);

        // If we've already finished negotiation and the incoming is an 'answer', ignore
        if (pc.signalingState === "stable" && desc.type === "answer") {
          console.log("Ignoring redundant answer (stable).");
          return;
        }

        // Set remote description (offer/answer)
        try {
          await pc.setRemoteDescription(desc);
          console.log("✅ Remote description set:", desc.type);
        } catch (err) {
          console.warn("❌ setRemoteDescription failed:", err);
          return;
        }

        // If this was an offer, create and send answer
        if (desc.type === "offer") {
          try {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("signal", { roomId: rid, description: pc.localDescription });
            console.log("📨 Sent answer");
          } catch (err) {
            console.warn("❌ create/set answer failed:", err);
          }
        }

        // apply queued ICE candidates
        if (pendingCandidatesRef.current.length) {
          for (const c of pendingCandidatesRef.current) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch (err) {
              console.warn("Queued ICE add error:", err);
            }
          }
          pendingCandidatesRef.current = [];
        }
      };

      // Register handlers (use named functions so we can remove)
      socket.on("ice_candidate", onRemoteIce);
      socket.on("signal", onSignal);

      // Caller creates offer
      if (isCaller) {
        (async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("signal", { roomId: rid, description: pc.localDescription });
            console.log("📨 Sent offer");
          } catch (err) {
            console.error("❌ Offer creation failed:", err);
          }
        })();
      }

      // connection state
      pc.onconnectionstatechange = () => {
  console.log("🔁 Connection state:", pc.connectionState);
  if (pc.connectionState === "connected") {
    setStatusMessage("Connected");

    // start timer
    setCallDuration(0);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
    // stop timer
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = null;
  }
};


      // cleanup when pc closed (remove handlers)
      const cleanupHandlers = () => {
        try {
          socket.off("ice_candidate", onRemoteIce);
          socket.off("signal", onSignal);
        } catch (err) {
          // ignore
        }
      };

      // When the peer connection is closed or becomes disconnected, cleanup listeners
      const origClose = pc.close.bind(pc);
      pc.close = () => {
        cleanupHandlers();
        try {
          origClose();
        } catch (err) {}
      };

      // store pc
      setPeerConnection(pc);
    },
    [socket, stream, peerConnection]
  );

  // -------------------
  // When matched - ensure both sides have media before negotiating
  // -------------------
  useEffect(() => {
    if (!socket) return;

    const onMatched = async ({ roomId: rid, role: r }: any) => {
      console.log("Matched:", rid, r);
      setStatusMessage("Matched! Connecting...");
      setRoomId(rid);

      // ensure we have camera/mic before creating peer connection
      const granted = await requestMediaAccess();
      if (!granted) {
        console.error("User denied camera/mic access – cannot start call.");
        setStatusMessage("Camera/Mic permission required!");
        return;
      }

      // small pause so tracks are available
      await new Promise((res) => setTimeout(res, 250));
      setupPeerConnection(rid, r === "caller");
    };

    socket.on("matched", onMatched);
    return () => {
      socket.off("matched", onMatched);
    };
  }, [socket, requestMediaAccess, setupPeerConnection]);

  // -------------------
  // remote toggle media listener
  // -------------------
  useEffect(() => {
    if (!socket) return;

    const onRemoteToggle = ({ kind, enabled }: any) => {
      console.log("Remote toggled:", kind, enabled);
      if (!remoteStream) return;

      if (kind === "video") {
        remoteStream.getVideoTracks().forEach((t) => (t.enabled = enabled));
      } else if (kind === "audio") {
        remoteStream.getAudioTracks().forEach((t) => (t.enabled = enabled));
      }
    };

    socket.on("remote_toggle_media", onRemoteToggle);
    return () => {
      socket.off("remote_toggle_media", onRemoteToggle);
    };
  }, [socket, remoteStream]);

  // -------------------
  // Toggle functions (also emit to remote so receiver can visually hide)
  // -------------------
  const toggleCamera = useCallback(() => {
    if (!stream || !socket || !roomId) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setCamOn(videoTrack.enabled);
    socket.emit("toggle_media", { roomId, kind: "video", enabled: videoTrack.enabled });
  }, [stream, socket, roomId]);

  const toggleMic = useCallback(() => {
    if (!stream || !socket || !roomId) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setMicOn(audioTrack.enabled);
    socket.emit("toggle_media", { roomId, kind: "audio", enabled: audioTrack.enabled });
  }, [stream, socket, roomId]);

  // -------------------
  // send chat
  // -------------------
  const sendMessage = useCallback(
    (text: string) => {
      if (!socket || !roomId) return;
      socket.emit("chat_message", { roomId, text });
      setChatMessages((prev) => [...prev, { from: "You", text }]);
    },
    [socket, roomId]
  );

  // -------------------
  // skip + helpers
  // -------------------
  const skipUser = useCallback(() => {
    if (socket && roomId) socket.emit("skip_user", { roomId });
    endChat(false);
    joinQueue();
  }, [socket, roomId, endChat, joinQueue]);

  return {
    role,
    stream,
    remoteStream,
    statusMessage,
    isCamOn,
    isMicOn,
    chatMessages,
    callDuration, 
    joinQueue,
    requestMediaAccess,
    toggleCamera,
    toggleMic,
    sendMessage,
    skipUser,
    endChat,
  };
}
