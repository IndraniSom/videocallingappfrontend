"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import { UserPlus, Check, X, Users, Search } from "lucide-react";

/**
 * Friend Requests — Polished Card UI
 *
 * Replaces the previous friend-requests page. Uses Tailwind utilities only.
 * Keeps the same hook API:
 *  - incomingRequests: array
 *  - loading: boolean
 *  - acceptFriendRequest(id)
 *  - rejectFriendRequest(id)
 *  - fetchFriends()
 *
 * Paste this file to replace your current page.
 */
type User = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};
type FriendRequest = {
  id?: string;
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  createdAt?: string;
  user: User;
};

const Avatar: React.FC<{ friend: FriendRequest; size?: number }> = ({ friend, size = 48 }) => {
  const initials = (friend.firstName?.[0] || friend.email?.[0] || "U").toUpperCase();
  if (friend.profilePicture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={friend.profilePicture}
        alt={`${friend.firstName ?? friend.email}'s avatar`}
        className={`w-${size} h-${size} rounded-full object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white font-semibold select-none"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
};

const FriendRequestsPage: React.FC = () => {
  const { incomingRequests, loading, acceptFriendRequest, rejectFriendRequest, fetchFriends } = useFriends();
  const [processing, setProcessing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyRecent, setOnlyRecent] = useState(false);

  useEffect(() => {
    // Ensure list is fresh when component mounts
    fetchFriends?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (friendId: string) => {
    try {
      setProcessing(friendId);
      await acceptFriendRequest(friendId);
      // refresh
      await fetchFriends?.();
    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (friendId: string) => {
    try {
      setProcessing(friendId);
      await rejectFriendRequest(friendId);
      // refresh
      await fetchFriends?.();
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setProcessing(null);
    }
  };

  const normalizedIncoming = useMemo(() => {
    return (incomingRequests || []).map((r: any) => {
      // normalize shape differences
      const id = r.id ?? r._id ?? r.friendId ?? "";
      return {
        ...r,
        id,
        firstName: r.firstName ?? r.first_name ?? r.name ?? "",
        email: r.email ?? r.user?.email ?? "",
        profilePicture: r.profilePicture ?? r.avatar ?? r.user?.avatar ?? null,
        createdAt: r.createdAt ?? r.created_at ?? r.createdAt,
      } as FriendRequest;
    });
  }, [incomingRequests]);

  const filtered = useMemo(() => {
    let list = normalizedIncoming;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => `${f.firstName ?? ""} ${f.lastName ?? ""} ${f.email ?? ""}`.toLowerCase().includes(q));
    }
    if (onlyRecent) {
      // show requests from last 14 days
      const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 14;
      list = list.filter((f) => {
        if (!f.createdAt) return false;
        const time = new Date(f.createdAt).getTime();
        return !Number.isNaN(time) && time >= cutoff;
      });
    }
    return list;
  }, [normalizedIncoming, query, onlyRecent]);
console.log("Filtered requests:", filtered);
  return (
    <div className="min-h-screen bg-[#5940df] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Friend Requests</h1>
            <p className="mt-1 text-sm text-white max-w-xl">Manage incoming friend requests — accept people you'd like to connect with and remove requests you don't want.</p>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <div className="relative flex items-center w-full sm:w-80">
              <span className="absolute left-3 text-slate-400"><Search className="w-4 h-4" /></span>
              <input
                aria-label="Search requests"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-slate-200 bg-[#654bf1] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-white cursor-pointer select-none">
                <input type="checkbox" checked={onlyRecent} onChange={() => setOnlyRecent((s) => !s)} className="h-4 w-4 rounded border-slate-300" />
                <span>Recent</span>
              </label>
              <button
                onClick={() => fetchFriends?.()}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm shadow hover:bg-indigo-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* content card */}
        <div className="bg-[#654bf1] rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center bg-indigo-600 text-white rounded-md w-10 h-10">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Incoming Requests</div>
                <div className="text-xs text-white">{loading ? "Loading…" : `${incomingRequests?.length ?? 0} pending`}</div>
              </div>
            </div>

            <div className="text-sm text-white">{filtered.length} visible</div>
          </div>

          <div className="p-4 sm:p-6">
            {/* empty / loading states */}
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <div className="text-sm text-white">Loading requests…</div>
              </div>
            ) : !incomingRequests || incomingRequests.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No friend requests</h3>
                <p className="mt-2 text-sm text-white max-w-xs">When people send you requests they'll appear here. Invite friends to start connecting.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-white">No requests match your search or filters.</div>
            ) : (
              // grid of cards
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((req: any) => {
                  const friend: FriendRequest = {
                    id: req.id ?? req._id ?? req.friendId,
                    firstName: req.firstName ?? req.name ?? "",
                    lastName: req.lastName ?? "",
                    email: req.email ?? "",
                    profilePicture: req.profilePicture ?? req.avatar ?? null,
                    createdAt: req.createdAt ?? req.created_at,
                    user: req.user,
                  };
                  const id = friend.id ?? "";

                  return (
                    <article
                      key={id || `${friend.email}-${Math.random()}`}
                      className="group bg-[#654bf1] rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Avatar friend={friend} size={56} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 truncate">{friend.user.firstName}</h4>
                              <p className="text-xs text-white truncate">{friend.email}</p>
                            </div>
                            <div className="text-xs text-slate-400">{friend.createdAt ? new Date(friend.createdAt).toLocaleDateString() : ""}</div>
                          </div>

                          <p className="mt-2 text-xs text-white">Mutual connections: <span className="font-medium text-slate-700">—</span></p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(id)}
                          disabled={processing !== null && processing !== id}
                          className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm ${
                            processing === id ? "bg-indigo-100 text-indigo-700 cursor-wait" : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {processing === id ? "Processing…" : <><Check className="w-4 h-4" /> Accept</>}
                        </button>

                        <button
                          onClick={() => handleReject(id)}
                          disabled={processing !== null && processing !== id}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm ${
                            processing === id ? "bg-red-50 text-red-500 cursor-wait" : "bg-transparent text-red-600 border border-red-100 "
                          }`}
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* helpful footer / actions */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-sm text-white">Tip: Accept people you know — keep your network safe.</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // bulk accept: accept visible ones
                const visibleIds = filtered.map((f: any) => f.id ?? f._id).filter(Boolean);
                if (!visibleIds.length) return;
                // quick confirm
                if (!confirm(`Accept ${visibleIds.length} request(s)?`)) return;
                visibleIds.forEach((id: string) => handleAccept(id));
              }}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm shadow hover:bg-emerald-700"
            >
              Accept All Visible
            </button>

            <button
              onClick={() => {
                const visibleIds = filtered.map((f: any) => f.id ?? f._id).filter(Boolean);
                if (!visibleIds.length) return;
                if (!confirm(`Remove ${visibleIds.length} request(s)?`)) return;
                visibleIds.forEach((id: string) => handleReject(id));
              }}
              className="inline-flex items-center gap-2 bg-transparent border border-slate-200 px-3 py-2 rounded-lg text-sm text-white "
            >
              Remove All Visible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestsPage;
