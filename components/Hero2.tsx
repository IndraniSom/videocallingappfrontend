"use client";
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { GenderSelectionModal } from "./GenderSelectionModal";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProfileSetupModal from './ProfileSetupModal';
import { X } from "lucide-react";
export default function Hero2() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const { user, loading } = useUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { signInWithGoogle } = useAuth();
  const [googleUserInfo, setGoogleUserInfo] = useState<any>(null);
  const router = useRouter();

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setShowGenderModal(false);
    // Retry Google sign-in with selected gender
    if (gender) {
      handleGoogleSignInWithGender(gender);
    }
  };

  const handleGoogleSignInWithGender = async (gender: 'male' | 'female') => {
    try {
      await signInWithGoogle(gender);
      router.push('/dashboard');
      setShowLoginDialog(false);
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
    }
  };
  const handleProfileSetupSubmit = async (gender: 'male' | 'female') => {
    try {
      // Complete the sign-up with the selected gender
      await signInWithGoogle(gender);
      setShowProfileSetup(false);
      setShowLoginDialog(false);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Profile setup failed:', error);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      // Try to sign in without gender first
      const result = await signInWithGoogle();
      router.push('/dashboard');
      setShowLoginDialog(false);
    } catch (error: any) {
      // If backend says user needs gender, show modal
      if (error.response?.data?.requiresGender ||
          error.response?.data?.message?.includes('Gender') ||
          error.response?.data?.message?.includes('gender') ||
          (error.response?.status === 400 && error.response?.data?.message?.includes('required'))) {
        setShowGenderModal(true);
      } else {
        console.error('Google sign-in failed:', error);
      }
    }
  };

  const handleFacebookSignIn = () => {
    // TODO: Implement Facebook sign-in
    console.log('Facebook sign-in not implemented yet');
  };

  return (
    <div className="min-h-fit bg-[#5940df] w-full">
     
      {/* Main Content */}
      <main className="container max-w-6xl mx-auto p-4 ">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-fuchsia-200">Talk With Strangers</span>
              <span className="text-white"> Make New Friends</span>
            </h1>
            
            <p className="text-xl text-white">
                Discover exciting conversations and connections with new friends.Try our random video chat platform now!
            </p>

            {!loading && !user ? (
              <button
                onClick={() => setShowLoginDialog(true)}
                className="w-full sm:w-auto px-8 py-4 bg-[#fffc01] text-black text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                LOGIN NOW TO EXPLORE
              </button>
            ) : (
              <Link href="/dashboard">
                <button className="w-full sm:w-auto px-8 py-4 bg-[#fffc01] text-black text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  MEET NEW PEOPLE NOW
                </button>
              </Link>
            )}
          </div>

          {/* Right Column - Images Grid */}
          <Image src="/hero.svg" alt="Image 1" width={700} height={200} className=" object-cover " />
        </div>
      </main>

      

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
      {showProfileSetup && googleUserInfo && (
        <ProfileSetupModal
          onSubmit={handleProfileSetupSubmit}
          userInfo={googleUserInfo}
        />
      )}
      </div>
    );
  }
