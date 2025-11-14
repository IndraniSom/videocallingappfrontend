"use client";
import React, { useState, useEffect } from "react";
import {
  Video,
  Heart,
  MessageCircle,
  User,
  Menu,
  X,
  LogOut,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Home, Clock, Cloud} from "lucide-react";

const navItems = [
  { id: "/dashboard", label: "Home", Icon: Home },
  { id: "/messages", label: "Recent", Icon: MessageCircle },
  { id: "/friend-requests", label: "Likes", Icon: User },
  { id: "cloud", label: "Cloud", Icon: Cloud },
];
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const { user, loading, logout } = useUserProfile();
  const [active, setActive] = useState("/dashboard");
  // Reset profile image error when user changes
  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profilePicture]);

  return (
    <nav className="sticky top-0 z-50 bg-[#5940df] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-red-500 font-bold text-xl sm:text-3xl">
              CooMeet
            </span>
          </div>

          {/* Desktop Navigation */}
         <div className="flex-1 flex items-center justify-center">
        <div
          role="navigation"
          aria-label="Primary"
          className="relative inline-flex items-center p-1 rounded-full border border-white/30 bg-white/5"
          style={{ padding: 6 }} // small visual padding like the image
        >
          {/* pill background (outline) */}
          <div className="relative flex items-center gap-4 px-3 py-1 rounded-full">
            {navItems.map((item) => {
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={`${item.id}`}>
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  aria-label={item.label}
                  className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full focus:outline-none"
                >
                  {/* Yellow circular indicator behind the active icon */}
                  <span
                    aria-hidden
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-200`}
                  >
                    <span
                      className={`transform transition-all duration-200 ${
                        isActive ? "scale-100" : "scale-0"
                      }`}
                      style={{
                        width: 38,
                        height: 28,
                        borderRadius: 9999,
                        background:
                          "linear-gradient(90deg, #FFFB00 0%, #FFE600 100%)",
                        boxShadow: isActive ? "0 6px 18px rgba(255, 235, 59, 0.25)" : "none",
                        display: "inline-block",
                      }}
                    />
                  </span>

                  {/* The icon itself sits above the yellow indicator */}
                  <item.Icon
                    className={`relative ${isActive ? "text-black" : "text-white/90"}`}
                    size={18}
                  />
                </button>
                </Link>
              );
            })}
          </div>

          {/* Outer rounded border to match screenshot (thin light border) */}
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.06)",
            }}
          />
        </div>
      </div>

          {/* Right Side (Desktop) */}
          <div className="hidden md:flex items-center gap-4 relative">
            {!loading && !user ? (
              <Link
                href="/login"
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Login / Register
              </Link>
            ) : (
              <>
                {/* Profile Icon */}
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 relative overflow-hidden"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user?.profilePicture && !profileImageError ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName || user.firstname || ''} ${user.lastName || user.lastname || ''}`}
                      className="w-full h-full object-cover"
                      onError={() => setProfileImageError(true)}
                    />
                  ) : (
                    <User className="w-5 h-5 text-red-500" />
                  )}
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="bg-gray-100 hover:bg-gray-200 text-black px-3 py-2 rounded-md text-sm flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>

                {/* Profile Dropdown */}
                {dropdownOpen && user && (
                  <div className="no-scrollbar absolute right-0 top-14 bg-[#3a2a5a] border border-gray-700 shadow-2xl rounded-2xl p-6 w-80 max-h-96 overflow-y-auto">
                    {/* Header Section with Avatar and Name */}
                    <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                          {user.profilePicture && !profileImageError ? (
                            <img
                              src={user.profilePicture}
                              alt={`${user.firstName || user.firstname || ''} ${user.lastName || user.lastname || ''}`}
                              className="w-full h-full object-cover"
                              onError={() => setProfileImageError(true)}
                            />
                          ) : (
                            <span>{(user.firstName || user.firstname || 'U')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">
                            {user.firstName || user.firstname || ''} {user.lastName || user.lastname || ''}
                          </p>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            ID: {user.id?.slice(0, 10) || 'N/A'}
                            <button className="text-gray-400 hover:text-white" title="Copy ID">📋</button>
                          </p>
                        </div>
                      </div>
                      <Link href="/profile" className="text-red-500 hover:text-red-400">
                        <span className="text-lg">✏️</span>
                      </Link>
                    </div>

                    {/* Premium Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 mb-6 flex items-start justify-between">
                      <div>
                        <p className="text-white font-bold flex items-center gap-2">
                          👑 Subscription Plans
                        </p>
                        <p className="text-purple-100 text-sm mt-1">Get More Gender Filters</p>
                      </div>
                      <button className="bg-yellow-400 text-white font-bold px-4 py-1 rounded-full text-sm hover:bg-yellow-300 transition">
                        Join
                      </button>
                    </div>

                   

                    {/* User Info Section */}
                    <div className="space-y-3 mb-6 bg-[#2a1a4a] rounded-xl p-4 ">
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="flex items-center gap-2">📅 Birthday</span>
                        <span>{user.dateOfBirth || user.dob || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="flex items-center gap-2">👥 Gender</span>
                        <span className="capitalize">{user.role || user.gender || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="flex items-center gap-2">✉️Email</span>
                        <span className="text-xs">{user.email || 'Not set'}</span>
                      </div>
                    </div>

                    {/* Footer Links */}
                    <div className="space-y-2 border-t border-gray-600 pt-4">
                      
                      <button
                        onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                        className="w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#4a3a6a] transition flex items-center gap-2"
                      >
                         More
                        <span className={`ml-auto transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`}>›</span>
                      </button>

                      {/* More Menu Items */}
                      {moreMenuOpen && (
                        <div className="space-y-1 ml-2 border-l border-gray-600 pl-3 mt-2">
                          <Link href="/about-us" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#4a3a6a] transition flex items-center gap-2 text-sm">
                            ℹ️ About Us
                          </Link>
                          <Link href="/contact-us" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#4a3a6a] transition flex items-center gap-2 text-sm">
                            📧 Contact Us
                          </Link>
                          <Link href="/faq" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#4a3a6a] transition flex items-center gap-2 text-sm">
                            ❓ FAQ
                          </Link>
                          <Link href="/terms-conditions" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#4a3a6a] transition flex items-center gap-2 text-sm">
                            📋 Terms & Conditions
                          </Link>
                          <Link href="/privacy-policy" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-[#4a3a6a] transition flex items-center gap-2 text-sm">
                            🔒 Privacy Policy
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {!loading && !user ? (
              <Link
                href="/login"
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={logout}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-800" />
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2  rounded-lg transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Icons Only */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 flex justify-around border-t border-gray-200 bg-[#5940df]">
           

           

            {user && (
              <Link
                href="/profile"
                className="flex flex-col items-center text-gray-700 hover:text-red-500"
              >
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Profile</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
