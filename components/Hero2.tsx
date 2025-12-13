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
export default function Hero2() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const { user, loading } = useUserProfile();
  const { signInWithGoogle } = useAuth();
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
        {showLoginDialog && (
          <div className="fixed inset-0 bg-white/50 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="relative bg-[#5940df] border-muted rounded-md border px-6 py-12 shadow-md max-w-sm w-full mx-4">
              <div className="flex flex-col items-center gap-y-2 mb-8">
                <h1 className="text-2xl font-semibold text-white">Welcome</h1>
              </div>

              {showGenderModal && <GenderSelectionModal onSelect={handleGenderSelect} />}

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full text-red-500 border-[1px] border-black rounded-md py-2 flex items-center justify-center gap-2 bg-gray-50 transition"
                >
                  <FcGoogle className="size-5" />
                  Sign in with Google
                </button>
                <button
                  type="button"
                  onClick={handleFacebookSignIn}
                  className="w-full text-blue-600 border-[1px] border-black rounded-md py-2 flex items-center justify-center gap-2 bg-gray-50 transition"
                >
                  <FaFacebook className="size-5" />
                  Sign in with Facebook
                </button>
              </div>

              <button
                onClick={() => setShowLoginDialog(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
