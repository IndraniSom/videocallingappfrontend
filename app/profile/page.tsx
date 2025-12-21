"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useUserProfile } from "@/hooks/useUserProfile";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ProfilePage() {
  const { user, loading } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const gender = useMemo(() => user?.role || user?.gender || "", [user]);
  const dateOfBirth = useMemo(() => user?.dateOfBirth || user?.dob || "", [user]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || user.firstname || "");
    setLastName(user.lastName || user.lastname || "");
    setProfilePicture(user.profilePicture || "");
  }, [user]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await axiosInstance.patch(`${API_URL}/auth/profile`, {
        firstName,
        lastName,
        profilePicture,
      });

      if (res?.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      setSuccess("Profile updated");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#5940df] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#5940df] text-white flex items-center justify-center">
        Please log in.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5940df] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-[#654bf1] rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold">{String(firstName || "U").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm text-white/80 mb-1">Profile Photo URL</label>
            <input
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg px-3 py-2 text-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-black"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-white/80 mb-1">Gender (locked)</label>
            <input value={gender} readOnly className="w-full rounded-lg px-3 py-2 text-black/70" />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Birthday (locked)</label>
            <input value={dateOfBirth} readOnly className="w-full rounded-lg px-3 py-2 text-black/70" />
          </div>
        </div>

        {error && <div className="mb-4 text-red-200">{error}</div>}
        {success && <div className="mb-4 text-green-200">{success}</div>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#fffc01] text-black font-bold py-3 rounded-lg disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
