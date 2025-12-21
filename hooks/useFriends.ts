"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export interface Friend {
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    profilePicture?: string;
  };
  status: "pending" | "accepted";
}

export interface OppositeUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  profilePicture?: string;
  status?: "not_friends" | "pending" | "accepted";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [users, setUsers] = useState<OppositeUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userId = user.id || user._id || null;

  // Fetch all data
  const fetchFriends = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/friends/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allFriends = res.data.friends || [];
      setFriends(allFriends);

      // Incoming = where status is pending and current user was not sender
      // Compare as strings to handle ObjectId vs string comparison
      const incoming = allFriends.filter(
        (f: any) => f.status === "pending" && String(f.user._id || f.user.id) !== String(userId)
      );
      setIncomingRequests(incoming);
    } catch (err) {
      console.error("❌ Fetch friends failed:", err);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  const fetchOppositeUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/friends/opposite-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("❌ Fetch opposite users failed:", err);
    }
  }, [token]);

  const sendFriendRequest = useCallback(
    async (userId: string) => {
      if (!token) return;
      try {
        await axios.post(
          `${API_URL}/friends/request/${userId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchOppositeUsers();
        toast.success("✅ Friend request sent!");
      } catch (err) {
        console.error("❌ Error sending friend request:", err);
      }
    },
    [token, fetchOppositeUsers]
  );

  const acceptFriendRequest = useCallback(
    async (userId: string) => {
      if (!token) return;
      try {
        await axios.post(`http://localhost:5000/api/friends/accept/${userId}`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});

        await fetchFriends();
      } catch (err) {
        console.error("❌ Accept request failed:", err);
      }
    },
    [token, fetchFriends]
  );

  const rejectFriendRequest = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await axios.post(
          `${API_URL}/friends/reject/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchFriends();
      } catch (err) {
        console.error("❌ Reject request failed:", err);
      }
    },
    [token, fetchFriends]
  );

  useEffect(() => {
    fetchFriends();
    fetchOppositeUsers();
  }, [fetchFriends, fetchOppositeUsers]);

  return {
    friends,
    users,
    incomingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    fetchFriends,
  };
}