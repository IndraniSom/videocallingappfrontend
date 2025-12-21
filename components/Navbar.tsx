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
import { auth } from "@/lib/firebase";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const navItems = [
  { id: "/dashboard", labelKey: "videochat", Icon: Video },
  { id: "/messages", labelKey: "messages", Icon: MessageCircle },
  { id: "/friend-requests", labelKey: "friend_requests", Icon: UserPlus },
  { id: "/call-history", labelKey: "call_history", Icon: Clock },
];

interface ProfileSetupModalProps {
  onSubmit: (payload: {
    gender: 'male' | 'female';
    name: string;
    birthday: string;
    profilePicture?: string;
  }) => void;
  userInfo: {
    name: string;
    email: string;
    profilePicture?: string;
    birthday?: string;
    gender?: 'male' | 'female';
  };
}

const ProfileSetupModal = ({ onSubmit, userInfo }: ProfileSetupModalProps) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(userInfo.gender ?? null);
  const [name, setName] = useState(userInfo.name || '');
  const [birthday, setBirthday] = useState(userInfo.birthday || '');
  const [profilePicture, setProfilePicture] = useState(userInfo.profilePicture || '');
  

  const handleSave = () => {
    if (selectedGender && name && birthday) {
      onSubmit({
        gender: selectedGender,
        name,
        birthday,
        profilePicture: profilePicture || undefined,
      });
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
                {profilePicture ? (
                  <img
                    src={profilePicture}
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

          {/* Profile Photo URL */}
          <div className="mb-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
              <span className="text-2xl">🖼️</span>
              <input
                type="url"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="Profile photo URL"
                className="flex-1 bg-transparent outline-none text-gray-800 font-medium"
              />
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

          {/* Email */}
          <div className="mb-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <input
                type="text"
                value={userInfo.email || ''}
                readOnly
                className="flex-1 bg-transparent outline-none text-gray-600 font-medium"
              />
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
  const [profileView, setProfileView] = useState<"main" | "more">("main");

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState<any>(null);
  const [facebookUserInfo, setFacebookUserInfo] = useState<any>(null);
  const { user, loading, logout } = useUserProfile();
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
 const maybeEndCallAndNavigate = async (href: string, closeMobileMenu?: boolean) => {
  if (!href) return;

  let activeCall: any = null;
  try {
    activeCall = JSON.parse(localStorage.getItem("activeCall") || "null");
  } catch {
    activeCall = null;
  }

  // 🔥 If call is active but user has NOT confirmed
  if (activeCall?.roomId && activeCall?.callId && pendingNav !== href) {
    toast.error("⚠ Leaving will disconnect the call. Click again to continue.");
    setPendingNav(href);
    return;
  }

  // 🔥 user confirmed → end call
  if (activeCall?.roomId && activeCall?.callId) {
    try {
      await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/call/end`, {
  roomId: activeCall.roomId,
  callId: activeCall.callId,
  forceEnd: true, // <-- backend will disconnect partner
});

    } catch (e) {
      console.error("Failed to end call before navigation", e);
    }

    try {
      localStorage.removeItem("activeCall");
    } catch {}
  }

  if (closeMobileMenu) setIsMobileMenuOpen(false);
  router.push(href);
  setPendingNav(null);
};


  const active = pathname;

  const { t, i18n } = useTranslation();

  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profilePicture]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
      if (languageMenuOpen && !target.closest('.language-dropdown-container')) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, languageMenuOpen]);

  const handleProfileSetupSubmit = async (payload: {
    gender: 'male' | 'female';
    name: string;
    birthday: string;
    profilePicture?: string;
  }) => {
    try {
      const [firstName, ...lastParts] = String(payload.name || "").trim().split(" ");
      const lastName = lastParts.join(" ");

      if (googleUserInfo) {
        await signInWithGoogle({
          role: payload.gender,
          dateOfBirth: payload.birthday,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          profilePicture: payload.profilePicture,
        });
      } else if (facebookUserInfo) {
        await signInWithFacebook({
          role: payload.gender,
          dateOfBirth: payload.birthday,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          profilePicture: payload.profilePicture,
        });
      }

      setShowProfileSetup(false);
      setShowLoginDialog(false);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Profile setup failed:', error);
      toast.error('Profile setup failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();

      // If successful (existing user login), force reload to update navbar
      setShowLoginDialog(false);
      router.push('/dashboard');
    } catch (error: any) {
      if (error?.requiresGender && error?.userInfo) {
        setGoogleUserInfo(error.userInfo);
        setShowProfileSetup(true);
        return;
      }

      console.error('Google sign-in failed:', error);
      toast.error(error?.response?.data?.message || 'Sign in failed. Please try again.');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook();
      setShowLoginDialog(false);
      router.push('/dashboard');
    } catch (error: any) {
      if (error?.requiresGender && error?.userInfo) {
        setFacebookUserInfo(error.userInfo);
        setShowProfileSetup(true);
        return;
      }
      console.error('Facebook sign-in failed:', error);
      toast.error(error?.response?.data?.message || 'Sign in failed. Please try again.');
    }
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
                    <Link
                      key={item.id}
                      href={`${item.id}`}
                      onClick={(e) => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("activeCall");
    if (raw) {
      e.preventDefault();
      void maybeEndCallAndNavigate(`${item.id}`);
      return;
    }
  }
}}

                    >
                      <button
                        aria-label={t(item.labelKey)}
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
                          {t(item.labelKey)}
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
            <div className="relative language-dropdown-container hidden sm:block">
              <button
                type="button"
                onClick={() => setLanguageMenuOpen((v) => !v)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-white/20"
                aria-label={t("language")}
              >
                <span className="text-base">🌐</span>
                <span className="hidden lg:inline">{t("language")}</span>
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 top-12 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 w-56 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("en");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇺🇸 United States (English)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("hi");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇮🇳 India (हिन्दी)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("de");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇩🇪 Germany (Deutsch)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("pt");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇵🇹 Portugal (Português)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("ru");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇷🇺 Russia (Русский)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("es");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇪🇸 Spain (Español)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("fr");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇫🇷 France (Français)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("it");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇮🇹 Italy (Italiano)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("ar");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇸🇦 Arabic (العربية)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("zh");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇨🇳 Chinese (中文)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("ja");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇯🇵 Japanese (日本語)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage("ko");
                      setLanguageMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    🇰🇷 Korean (한국어)
                  </button>
                </div>
              )}
            </div>

            {!loading && !user ? (
              <>
                <button
                  onClick={() => setShowLoginDialog(true)}
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#FFFB00] via-[#FFE600] to-[#FFD700] text-black px-5 lg:px-7 py-2.5 lg:py-3 rounded-md font-bold hover:shadow-[0_0_25px_rgba(255,235,59,0.6)] hover:scale-105 transition-all duration-300 border-2 border-yellow-300/50 shadow-lg"
                  style={{
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <span className="hidden lg:inline">{t("login_register")}</span>
                  <span className="lg:hidden">{t("login")}</span>
                </button>
                <button
                  onClick={() => setShowLoginDialog(true)}
                  className="sm:hidden flex items-center gap-1 bg-gradient-to-r from-[#FFFB00] to-[#FFE600] text-black px-4 py-2 rounded-md text-sm font-bold shadow-lg"
                >
                  {t("login")}
                </button>
              </>
            ) : (
              
              <div className="hidden md:flex items-center gap-3 relative dropdown-container">
                {user && (
                  
                  <button
                  className="w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-white to-gray-100 hover:from-yellow-100 hover:to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden ring-2 ring-white/40 hover:ring-yellow-300 hover:scale-110"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user.profilePicture ? (
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
)}
                {/* <button
                  onClick={logout}
                  className="hidden lg:flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("logout")}</span>
                </button> */}
              

                {dropdownOpen && user && (
                  <div className="no-scrollbar absolute right-0 top-12 lg:top-14 bg-gradient-to-br from-[#3a2a5a] to-[#2a1a4a] border border-white/10 shadow-2xl rounded-2xl p-4 lg:p-6 w-72 lg:w-80 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold overflow-hidden ring-2 ring-white/20">
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
                      {profileView === "main" && (
<>
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
                    <button
  onClick={() => setProfileView("more")}
  className="w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-between text-sm"
>
  📋 More
  <span>›</span>
</button>
<button
  onClick={logout}
  className="w-full mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
>
  <LogOut className="w-4 h-4" />
  <span>Logout</span>
</button>

</>
                      )}
                       
                    {profileView === "more" && (
  <>
    {/* More Header */}
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => setProfileView("main")}
        className="text-white text-lg"
      >
        ←
      </button>
      <h2 className="text-white font-semibold text-base">More</h2>
    </div>

    {/* More options (FULL WIDTH) */}
    <div className="flex flex-col space-y-4 text-white text-sm">
      <button className="text-left py-2">Blocklist</button>
      <Link href="/about-us">About Us</Link>
      <Link href="/safety">Safety</Link>
      <Link href="/community">Community</Link>
      <Link href="/privacy-policy">Privacy Policy</Link>
      <Link href="/terms-conditions">Terms Of Service</Link>
      <Link href="/contact-us">Contact Us</Link>
      <Link href="/faq">FAQ</Link>
      <Link href="/account-security">Account & Security</Link>
    </div>
  </>
)}
                  </div>

                )}
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
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
                    onClick={(e) => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("activeCall");
    if (raw) {
      e.preventDefault();
      void maybeEndCallAndNavigate(`${item.id}`);
      return;
    }
  }
}}

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
                      {t(item.labelKey)}
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
      {showProfileSetup && (googleUserInfo || facebookUserInfo) && (
        <ProfileSetupModal
          onSubmit={handleProfileSetupSubmit}
          userInfo={googleUserInfo || facebookUserInfo}
        />
      )}
    </nav>
  );
};

export default Navbar;