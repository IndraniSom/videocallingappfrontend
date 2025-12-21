"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";
import { useFriends } from "@/hooks/useFriends";
import { Users, UserPlus, Clock, Video, CheckCircle, Loader2 } from "lucide-react";

type FriendStatus = "not_friends" | "pending" | "accepted";

type CallHistoryItem = {
  _id: string;
  caller: any;
  callee: any;
  startedAt?: string;
  endedAt?: string;
  status?: string;
  durationSeconds?: number;
  otherUser?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    profilePicture?: string;
  };
  friendStatus?: FriendStatus;
};

function formatDuration(seconds?: number) {
  const s = Math.max(0, Number(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;

  if (h > 0) return `${h}h ${m}m ${r}s`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function CallHistoryPage() {
  const { sendFriendRequest } = useFriends();

  const [calls, setCalls] = useState<CallHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/video/history");
      setCalls(res.data?.calls || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load call history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const stats = useMemo(() => {
    const total = calls.length;
    const completed = calls.filter((c) => c.status === "completed").length;
    const totalSeconds = calls.reduce((acc, c) => acc + Number(c.durationSeconds || 0), 0);
    return { total, completed, totalSeconds };
  }, [calls]);

  const handleAddFriend = async (otherUserId: string) => {
    try {
      setProcessingUserId(otherUserId);
      await sendFriendRequest(otherUserId);
      setCalls((prev) =>
        prev.map((c) =>
          c.otherUser?._id === otherUserId ? { ...c, friendStatus: "pending" } : c
        )
      );
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#5940df] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Call History</h1>
            <p className="text-white/80 mt-1">Your recent video call connections</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#4a3a6a] border border-[#5a4a7a] rounded-xl px-4 py-2">
              <Users className="w-4 h-4 text-[#fffc01]" />
              <span className="text-sm text-white/90">{stats.total} calls</span>
            </div>
            <div className="flex items-center gap-2 bg-[#4a3a6a] border border-[#5a4a7a] rounded-xl px-4 py-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/90">{stats.completed} completed</span>
            </div>
            <div className="flex items-center gap-2 bg-[#4a3a6a] border border-[#5a4a7a] rounded-xl px-4 py-2">
              <Clock className="w-4 h-4 text-cyan-300" />
              <span className="text-sm text-white/90">{formatDuration(stats.totalSeconds)} total</span>
            </div>
          </div>
        </div>

        <div className="bg-[#654bf1] rounded-2xl border border-[#5a4a7a] shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#5a4a7a] flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Video className="w-5 h-5 text-[#fffc01]" />
              <span>Recent calls</span>
            </div>
            <button
              onClick={loadHistory}
              className="text-sm px-3 py-2 rounded-lg bg-[#4a3a6a] hover:bg-[#5a4a7a] border border-[#5a4a7a] transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center text-white/80">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading history...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-200">
              {error}
            </div>
          ) : calls.length === 0 ? (
            <div className="py-16 text-center text-white/80">
              No call history yet.
            </div>
          ) : (
            <div className="divide-y divide-[#5a4a7a]">
              {calls.map((c) => {
                const u = c.otherUser;
                const name = `${u?.firstName || ""} ${u?.lastName || ""}`.trim() || u?.email || "Unknown";
                const status = (c.friendStatus || "not_friends") as FriendStatus;
                const isBusy = processingUserId === u?._id;

                return (
                  <div key={c._id} className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                        {u?.profilePicture ? (
                          <Image
                            src={u.profilePicture}
                            alt="avatar"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <Image
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6b4fd4&color=fff`}
                            unoptimized
                            alt="avatar"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-white truncate max-w-[320px]">{name}</p>
                          {u?.role && (
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">
                              {u.role}
                            </span>
                          )}
                          {status === "accepted" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 border border-green-400/30 text-green-200">
                              Friends
                            </span>
                          )}
                          {status === "pending" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/15 border border-yellow-400/30 text-yellow-200">
                              Request pending
                            </span>
                          )}
                        </div>
                        {/* {u?.email && <p className="text-sm text-white/70 truncate max-w-[520px]">{u.email}</p>} */}

                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-white/70">
                          <div className="bg-[#4a3a6a] border border-[#5a4a7a] rounded-lg px-3 py-2">
                            <span className="text-white/90"></span> {formatDateTime(c.startedAt)}
                          </div>
                          {/* <div className="bg-[#4a3a6a] border border-[#5a4a7a] rounded-lg px-3 py-2">
                            <span className="text-white/90">Ended:</span> {c.endedAt ? formatDateTime(c.endedAt) : "-"}
                          </div> */}
                          <div className="bg-[#4a3a6a] border border-[#5a4a7a] rounded-lg px-3 py-2">
                            <span className="text-white/90">Duration:</span> {formatDuration(c.durationSeconds)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === "not_friends" ? (
                        <button
                          onClick={() => u?._id && handleAddFriend(u._id)}
                          disabled={!u?._id || isBusy}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                            isBusy
                              ? "bg-white/10 border-white/10 text-white/60 cursor-wait"
                              : "bg-gradient-to-r from-green-500 to-green-600 border-green-300/30 text-white hover:shadow-lg hover:shadow-green-500/30"
                          }`}
                        >
                          {isBusy ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" /> Add Friend
                            </>
                          )}
                        </button>
                      ) : status === "pending" ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 border border-white/10 text-white/70"
                        >
                          Pending
                        </button>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-500/15 border border-green-400/30 text-green-200"
                        >
                          Friends
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
