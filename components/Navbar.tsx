"use client";
import React, { useState } from "react";
import {
  Video,
  Heart,
  MessageCircle,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, loading, logout } = useUserProfile();

  return (
    <nav className="sticky top-0 z-50 bg-white text-black shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-red-500 font-bold text-xl sm:text-3xl">
              CooMeet
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
            >
              <Video className="w-5 h-5" />
              <span className="font-medium">Video Chat</span>
            </Link>

            <Link
              href="/dating"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Dating</span>
            </Link>

            <Link
              href="/messages"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>
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
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 relative"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User className="w-5 h-5 text-red-500" />
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
                  <div className="absolute right-0 top-14 bg-white border border-gray-200 shadow-lg rounded-md p-4 w-56">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Name:</span>{" "}
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Email:</span> {user.email}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Role:</span>{" "}
                      {user.role || "N/A"}
                    </p>
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
              className="text-black p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
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
          <div className="md:hidden py-4 flex justify-around border-t border-gray-200 bg-white">
            <Link
              href="/dashboard"
              className="flex flex-col items-center text-gray-700 hover:text-red-500"
            >
              <Video className="w-6 h-6" />
              <span className="text-xs mt-1">Chat</span>
            </Link>

            <Link
              href="/dating"
              className="flex flex-col items-center text-gray-700 hover:text-red-500"
            >
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">Dating</span>
            </Link>

            <Link
              href="/messages"
              className="flex flex-col items-center text-gray-700 hover:text-red-500"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">Messages</span>
            </Link>

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
