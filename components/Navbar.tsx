"use client"
import React, { useState, useEffect } from 'react';
import { Video, Camera, Heart, MessageCircle, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
   <nav className="relative z-50 bg-white text-black text-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              
              <span className="text-red-500 font-bold text-lg sm:text-3xl">CooMeet</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-4 lg:px-6 py-2 text-black hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Video className="w-5 h-5" />
              <span className="font-medium">Video chat</span>
            </a>
            <a
              href="/dating"
              className="flex items-center gap-2 px-4 lg:px-6 py-2 text-black hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Dating</span>
            </a>
            <a
              href="/messages"
              className="flex items-center gap-2 px-4 lg:px-6 py-2 text-black hover:bg-white/10 rounded-lg transition-all duration-300 relative"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Messages</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </a>
          </div>

          {/* Profile Icon */}
          <div className="hidden md:flex items-center gap-4">
            <button className="w-10 h-10 lg:w-12 lg:h-12  flex items-center justify-center ">
              <User className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/10">
            <a
              href="#video-chat"
              className="flex items-center gap-3 px-4 py-3 text-black hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Video className="w-5 h-5" />
              <span className="font-medium">Video chat</span>
            </a>
            <a
              href="#dating"
              className="flex items-center gap-3 px-4 py-3 text-black hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Dating</span>
            </a>
            <a
              href="#messages"
              className="flex items-center gap-3 px-4 py-3 text-black hover:bg-white/10 rounded-lg transition-all duration-300 relative"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Messages</span>
              <span className="absolute top-3 left-12 w-2 h-2 bg-red-500 rounded-full"></span>
            </a>
            <a
              href="#profile"
              className="flex items-center gap-3 px-4 py-3 text-black hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar