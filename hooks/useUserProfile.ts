"use client";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axiosInstance from "@/lib/axiosInstance";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useUserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

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

    fetchProfile();
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
    window.location.href = "/login";
  };

  return { user, loading, logout };
}
