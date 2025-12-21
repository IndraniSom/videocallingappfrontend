"use client";
import { useState, useEffect } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axiosInstance from "@/lib/axiosInstance";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useUserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`${API_URL}/auth/me`);
        setUser(res.data.user);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setUser(null);
        // Clear invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      const token = localStorage.getItem("token");

      if (!firebaseUser && !token) {
        setUser(null);
        setLoading(false);
        return;
      }

      await fetchProfile();
    });

    // also run once on mount (covers the case where token exists but auth state is delayed)
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return { user, loading, logout };
}
