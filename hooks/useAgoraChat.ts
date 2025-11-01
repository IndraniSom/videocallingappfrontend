"use client";
import { useRef, useState, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import axios from "axios";

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
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;
      setChannelName(channel);

      console.log("Joining Agora channel with:", {
        appId: APP_ID,
        channel,
        account,
      });

      await client.join(APP_ID, channel, token, account);

      const mic = await AgoraRTC.createMicrophoneAudioTrack();
      const cam = await AgoraRTC.createCameraVideoTrack();

      setLocalAudioTrack(mic);
      setLocalVideoTrack(cam);

      await client.publish([mic, cam]);
      console.log("✅ Published local tracks");

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

      client.on("user-unpublished", (user) => {
        console.log("❌ Remote user unpublished:", user.uid);
        setRemoteTracks({});
      });

      client.on("user-left", (user) => {
        console.log("👋 Remote user left:", user.uid);
        setRemoteTracks({});
      });

      return { mic, cam };
    },
    []
  );

  // 🔹 Leave channel
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

  // 🔹 Matchmaking poller — handles both caller & callee
  const joinMatchQueue = useCallback(async (token: string) => {
    console.log("Joining match queue...");
    let matchedResponse = null;

    while (!matchedResponse) {
      const res = await axios.post(
        `${API_URL}/match/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Match response:", res.data);

      if (res.data.matched) {
        matchedResponse = res.data;
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // ✅ Ensure both sides return consistent structure
    return {
      matched: true,
      roomId: matchedResponse.roomId,
      channelName: matchedResponse.channelName,
      role: matchedResponse.role,
      yourToken: matchedResponse.yourToken,
      yourAccount: matchedResponse.yourAccount,
      other: matchedResponse.other,
    };
  }, []);

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
