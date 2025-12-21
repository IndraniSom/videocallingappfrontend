"use client";
import { useRef, useState, useCallback } from "react";
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import axios from "axios";

let AgoraRTC: typeof import("agora-rtc-sdk-ng").default | null = null;

async function getAgoraRTC() {
  if (typeof window === "undefined") {
    throw new Error("AgoraRTC can only be loaded in the browser");
  }
  if (!AgoraRTC) {
    const mod = await import("agora-rtc-sdk-ng");
    AgoraRTC = mod.default;
  }
  return AgoraRTC;
}

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useAgoraChat() {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [remoteTracks, setRemoteTracks] = useState<{
    video?: IRemoteVideoTrack;
    audio?: IRemoteAudioTrack;
  }>({});
  const [channelName, setChannelName] = useState<string | null>(null);

  // 🔹 Join Agora channel
  const joinChannel = useCallback(
    async (channel: string, token: string, account: string) => {
      if (!APP_ID) throw new Error("Missing NEXT_PUBLIC_AGORA_APP_ID");

      const rtc = await getAgoraRTC();

      const client = rtc.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;
      setChannelName(channel);

      // 🔹 Register event listeners BEFORE joining to avoid missing events
      client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteTracks((prev) => ({ ...prev, video: user.videoTrack! }));
          console.log("📹 Subscribed to remote video");
        }
        if (mediaType === "audio") {
          setRemoteTracks((prev) => ({ ...prev, audio: user.audioTrack! }));
          user.audioTrack?.play();
          console.log("🔊 Subscribed to remote audio");
        }
      });

      client.on("user-unpublished", (_user: IAgoraRTCRemoteUser, mediaType) => {
        console.log("❌ Remote user unpublished:", mediaType);
        if (mediaType === "video") {
          setRemoteTracks((prev) => {
            const next = { ...prev };
            delete next.video;
            return next;
          });
        }
        if (mediaType === "audio") {
          setRemoteTracks((prev) => {
            const next = { ...prev };
            delete next.audio;
            return next;
          });
        }
      });

      client.on("user-left", () => {
        console.log("👋 Remote user left");
        setRemoteTracks({});
      });

      console.log("Joining Agora channel with:", {
        appId: APP_ID,
        channel,
        account,
      });

      await client.join(APP_ID, channel, token, account);

      // 🔹 Subscribe to any already-published users (important for the first-joiner case)
      for (const user of client.remoteUsers) {
        try {
          if (user.hasVideo) {
            await client.subscribe(user, "video");
            setRemoteTracks((prev) => ({ ...prev, video: user.videoTrack! }));
            console.log("📹 Subscribed to already-published remote video");
          }
          if (user.hasAudio) {
            await client.subscribe(user, "audio");
            setRemoteTracks((prev) => ({ ...prev, audio: user.audioTrack! }));
            user.audioTrack?.play();
            console.log("🔊 Subscribed to already-published remote audio");
          }
        } catch (e) {
          console.warn("Failed to subscribe to existing remote user", e);
        }
      }

      const mic = await rtc.createMicrophoneAudioTrack();
      const cam = await rtc.createCameraVideoTrack();

      setLocalAudioTrack(mic);
      setLocalVideoTrack(cam);

      await client.publish([mic, cam]);
      console.log("✅ Published local tracks");

      return { mic, cam };
    },
    []
  );

  // 🔹 Leave channel and cleanup
  const leaveChannel = useCallback(async () => {
    console.log("Leaving Agora channel...");
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current.removeAllListeners();
      clientRef.current = null;
    }
    setRemoteTracks({});
    setChannelName(null);
    console.log("✅ Left channel");
  }, [localAudioTrack, localVideoTrack]);

  // 🔹 Toggle mic / camera
  const toggleMic = useCallback(() => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!localAudioTrack.enabled);
      console.log(`🎤 Mic ${localAudioTrack.enabled ? "enabled" : "muted"}`);
    }
  }, [localAudioTrack]);

  const toggleCamera = useCallback(() => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!localVideoTrack.enabled);
      console.log(
        `🎥 Camera ${localVideoTrack.enabled ? "enabled" : "disabled"}`
      );
    }
  }, [localVideoTrack]);

  // 🔹 Matchmaking request
  const joinMatchQueue = useCallback(
    async (token: string, lookingFor: "male" | "female" | "both" = "both") => {
      const res = await axios.post(
        `${API_URL}/match/join`,
        { lookingFor }, // ✅ correct field name and value
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Match response:", res.data);
      return res.data;
    },
    []
  );

  return {
    joinChannel,
    leaveChannel,
    toggleMic,
    toggleCamera,
    remoteTracks,
    localVideoTrack,
    localAudioTrack,
    channelName,
    joinMatchQueue,
  };
}
