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
  Camera,
  Cake,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Home, Clock, Cloud} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaMale, FaFemale } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const navItems = [
  { id: "/dashboard", label: "Home", Icon: Home },
  { id: "/messages", label: "Recent", Icon: MessageCircle },
  { id: "/friend-requests", label: "Likes", Icon: User },
];

interface ProfileSetupModalProps {
  onSubmit: (gender: 'male' | 'female') => void;
  userInfo: {
    name: string;
    email: string;
    profilePicture?: string;
  };
}

const ProfileSetupModal = ({ onSubmit, userInfo }: ProfileSetupModalProps) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [name, setName] = useState(userInfo.name || '');
  const [birthday, setBirthday] = useState('');

  const handleSave = () => {
    if (selectedGender && name && birthday) {
      onSubmit(selectedGender);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">My Profile</h2>

          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {userInfo.profilePicture ? (
                  <img
                    src={userInfo.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{name.charAt(0).toUpperCase() || 'P'}</span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
              <span className="text-2xl">😊</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                maxLength={16}
                className="flex-1 bg-transparent outline-none text-gray-800 font-medium"
              />
              <span className="text-xs text-gray-400">{name.length}/16</span>
            </div>
          </div>

          {/* Birthday Input */}
          <div className="mb-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
              <Cake className="w-5 h-5 text-pink-500" />
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                placeholder="01/01/2000"
                className="flex-1 bg-transparent outline-none text-gray-800 font-medium"
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div className="mb-4">
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedGender('male')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedGender === 'male'
                    ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl">👨</span>
                <span>Guy</span>
              </button>
              
              <button
                onClick={() => setSelectedGender('female')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedGender === 'female'
                    ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl">👩</span>
                <span>Girl</span>
              </button>
            </div>
          </div>

          {/* Warning Text */}
          <p className="text-xs text-gray-500 text-center mb-6">
            You cannot change your gender or birthday after registration
          </p>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!selectedGender || !name || !birthday}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 ${
              selectedGender && name && birthday
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState<any>(null);
  const { user, loading, logout } = useUserProfile();
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname;

  // Force re-render when user data changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      window.location.reload();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profilePicture]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleProfileSetupSubmit = async (gender: 'male' | 'female') => {
    try {
      // Complete the sign-up with the selected gender
      await signInWithGoogle(gender);
      setShowProfileSetup(false);
      setShowLoginDialog(false);
      
      // Force reload to update navbar with user data
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Profile setup failed:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      // If successful (existing user login), force reload to update navbar
      setShowLoginDialog(false);
      window.location.href = '/dashboard';
    } catch (error: any) {
      // Check if this is a NEW USER that needs to complete profile setup
      const isNewUserSignup = error.response?.data?.requiresGender || 
                              error.response?.data?.isNewUser ||
                              (error.response?.data?.message?.includes('Gender') && !error.response?.data?.user) ||
                              (error.response?.data?.message?.includes('gender') && !error.response?.data?.user) ||
                              (error.response?.status === 400 && error.response?.data?.message?.includes('required'));
      
      // Check if this is an EXISTING USER trying to log in (has user data but missing something)
      const isExistingUser = error.response?.data?.user || 
                            error.response?.data?.token ||
                            error.response?.data?.message?.includes('already exists') ||
                            error.response?.data?.message?.includes('login');
      
      if (isNewUserSignup && !isExistingUser) {
        // This is a NEW USER - show profile setup modal
        const userInfo = {
          name: error.response?.data?.name || error.response?.data?.firstName || '',
          email: error.response?.data?.email || '',
          profilePicture: error.response?.data?.profilePicture || error.response?.data?.picture || '',
        };
        
        setGoogleUserInfo(userInfo);
        setShowProfileSetup(true);
      } else if (isExistingUser) {
        // This is an EXISTING USER - just redirect to dashboard
        setShowLoginDialog(false);
        window.location.href = '/dashboard';
      } else {
        // Some other error occurred
        console.error('Google sign-in failed:', error);
        alert(error.response?.data?.message || 'Sign in failed. Please try again.');
      }
    }
  };

  const handleFacebookSignIn = () => {
    console.log('Facebook sign-in not implemented yet');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#5940df] text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <Link href='/' className="flex items-center flex-shrink-0">
            <img
              src="/logo.svg"
              alt="CooMeet Logo"
              className="h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          {!loading && user && (<div className="hidden md:flex flex-1 items-center justify-center px-4">
            <div
              role="navigation"
              aria-label="Primary"
              className="relative inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md shadow-lg"
              style={{ padding: 6 }}
            >
              <div className="relative flex items-center gap-1 px-2 py-1.5 rounded-full">
                {navItems.map((item) => {
                  const isActive = item.id === active;
                  return (
                    <Link key={item.id} href={`${item.id}`}>
                      <button
                        aria-label={item.label}
                        className="relative z-10 flex gap-2 items-center justify-center px-4 py-2 rounded-full focus:outline-none transition-all duration-300 hover:scale-105 group min-w-[80px]"
                      >
                        <span
                          aria-hidden
                          className={`absolute inset-0 rounded-full transition-all duration-300 ${
                            isActive ? "scale-100 opacity-100" : "scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-30"
                          }`}
                          style={{
                            background: isActive 
                              ? "linear-gradient(135deg, #FFFB00 0%, #FFE600 100%)"
                              : "rgba(255, 255, 255, 0.1)",
                            boxShadow: isActive ? "0 4px 20px rgba(255, 235, 59, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3)" : "none",
                          }}
                        />
                        <item.Icon
                          className={`relative transition-all duration-300 mb-1 ${
                            isActive ? "text-black" : "text-white/90 group-hover:text-white"
                          }`}
                          size={20}
                        />
                        <span className={`relative text-xs font-medium transition-all duration-300 ${
                          isActive ? "text-black" : "text-white/80 group-hover:text-white"
                        }`}>
                          {item.label}
                        </span>
                      </button>
                    </Link>
                  );
                })}
              </div>
              <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          </div>)}

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            {!loading && !user ? (
              <>
                <button
                  onClick={() => setShowLoginDialog(true)}
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#FFFB00] via-[#FFE600] to-[#FFD700] text-black px-5 lg:px-7 py-2.5 lg:py-3 rounded-md font-bold hover:shadow-[0_0_25px_rgba(255,235,59,0.6)] hover:scale-105 transition-all duration-300 border-2 border-yellow-300/50 shadow-lg"
                  style={{
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <span className="hidden lg:inline">Login / Register</span>
                  <span className="lg:hidden">Login</span>
                </button>
                <button
                  onClick={() => setShowLoginDialog(true)}
                  className="sm:hidden flex items-center gap-1 bg-gradient-to-r from-[#FFFB00] to-[#FFE600] text-black px-4 py-2 rounded-md text-sm font-bold shadow-lg"
                >
                  Login
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3 relative dropdown-container">
                <button
                  className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-white to-gray-100 hover:from-yellow-100 hover:to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden ring-2 ring-white/40 hover:ring-yellow-300 hover:scale-110"
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
                    <User className="w-5 h-5 lg:w-6 lg:h-6 text-[#5940df]" />
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#5940df] rounded-full"></span>
                </button>

                <button
                  onClick={logout}
                  className="hidden lg:flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>

                {dropdownOpen && user && (
                  <div className="no-scrollbar absolute right-0 top-12 lg:top-14 bg-gradient-to-br from-[#3a2a5a] to-[#2a1a4a] border border-white/10 shadow-2xl rounded-2xl p-4 lg:p-6 w-72 lg:w-80 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xl lg:text-2xl font-bold overflow-hidden ring-2 ring-white/20">
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
                          <p className="text-white font-bold text-base lg:text-lg">
                            {user.firstName || user.firstname || ''} {user.lastName || user.lastname || ''}
                          </p>
                          <p className="text-gray-400 text-xs lg:text-sm flex items-center gap-1">
                            ID: {user.id?.slice(0, 8) || 'N/A'}...
                          </p>
                        </div>
                      </div>
                      <Link href="/profile" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                        <span className="text-lg">✏️</span>
                      </Link>
                    </div>

                    {/* <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-3 lg:p-4 mb-4 lg:mb-6 flex items-center justify-between shadow-lg">
                      <div className="flex-1">
                        <p className="text-white font-bold flex items-center gap-2 text-sm lg:text-base">
                          👑 Subscription Plans
                        </p>
                        <p className="text-purple-100 text-xs lg:text-sm mt-1">Get More Gender Filters</p>
                      </div>
                      <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm hover:shadow-lg hover:scale-105 transition-all duration-300">
                        Join
                      </button>
                    </div> */}

                    <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6 bg-[#2a1a4a] rounded-xl p-3 lg:p-4">
                      <div className="flex items-center justify-between text-gray-300 text-sm">
                        <span className="flex items-center gap-2">📅 Birthday</span>
                        <span className="text-xs lg:text-sm">{user.dateOfBirth || user.dob || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300 text-sm">
                        <span className="flex items-center gap-2">👥 Gender</span>
                        <span className="capitalize text-xs lg:text-sm">{user.role || user.gender || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-300 text-sm">
                        <span className="flex items-center gap-2">✉️ Email</span>
                        <span className="text-xs truncate max-w-[150px]">{user.email || 'Not set'}</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-white/10 pt-3 lg:pt-4">
                      <button
                        onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                        className="w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-between text-sm"
                      >
                        📋 More
                        <span className={`transition-transform duration-300 ${moreMenuOpen ? 'rotate-90' : ''}`}>›</span>
                      </button>

                      {moreMenuOpen && (
                        <div className="space-y-1 ml-2 border-l-2 border-white/10 pl-3 mt-2 animate-in slide-in-from-left-1 duration-200">
                          <Link href="/about-us" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm">
                            ℹ️ About Us
                          </Link>
                          <Link href="/contact-us" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm">
                            📧 Contact Us
                          </Link>
                          <Link href="/faq" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm">
                            ❓ FAQ
                          </Link>
                          <Link href="/terms-conditions" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm">
                            📋 Terms & Conditions
                          </Link>
                          <Link href="/privacy-policy" className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm">
                            🔒 Privacy Policy
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex justify-around py-3 border-t border-white/10">
              {navItems.map((item) => {
                const isActive = item.id === active;
                return (
                  <Link
                    key={item.id}
                    href={item.id}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`p-2 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#fffc01] to-[#ffe600]' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}>
                      <item.Icon 
                        className={`w-5 h-5 ${isActive ? 'text-black' : 'text-white'}`} 
                      />
                    </div>
                    <span className={`text-xs ${isActive ? 'text-yellow-400 font-semibold' : 'text-white/80'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="space-y-2 px-4 pt-3 border-t border-white/10">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {user.profilePicture && !profileImageError ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setProfileImageError(true)}
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">
                      {user.firstName || user.firstname || ''} {user.lastName || user.lastname || ''}
                    </p>
                    <p className="text-gray-400 text-xs">View Profile</p>
                  </div>
                </Link>
                
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Dialog */}
      {showLoginDialog && !showProfileSetup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="relative bg-gradient-to-br from-[#5940df] to-[#4a30cf] rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center gap-2 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome Back</h1>
                <p className="text-white/70 text-sm text-center">Sign in to continue your journey</p>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 rounded-xl py-3 sm:py-3.5 flex items-center justify-center gap-3 font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <FcGoogle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">Sign in with Google</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleFacebookSignIn}
                  className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl py-3 sm:py-3.5 flex items-center justify-center gap-3 font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <FaFacebook className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">Sign in with Facebook</span>
                </button>
              </div>

              <button
                onClick={() => setShowLoginDialog(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Setup Modal */}
      {showProfileSetup && googleUserInfo && (
        <ProfileSetupModal
          onSubmit={handleProfileSetupSubmit}
          userInfo={googleUserInfo}
        />
      )}
    </nav>
  );
};

export default Navbar;