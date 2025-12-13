import React from 'react'
import { useState, useEffect } from 'react';
import { X, Cake, Camera, User as UserIcon } from "lucide-react";

interface ProfileSetupModalProps {
  onSubmit: (gender: 'male' | 'female', data: { name: string; birthday: string }) => void;
  userInfo: {
    name: string;
    email: string;
    profilePicture?: string;
    birthday?: string;
    dateOfBirth?: string;
  };
}

const ProfileSetupModal = ({ onSubmit, userInfo }: ProfileSetupModalProps) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [name, setName] = useState(userInfo.name || '');
  const [birthday, setBirthday] = useState(userInfo.birthday || userInfo.dateOfBirth || '');

  // Update states if userInfo changes
  useEffect(() => {
    setName(userInfo.name || '');
    setBirthday(userInfo.birthday || userInfo.dateOfBirth || '');
  }, [userInfo]);

  const handleSave = () => {
    if (selectedGender) {
      onSubmit(selectedGender, {
        name,
        birthday
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Complete Your Profile</h2>

          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden ring-4 ring-purple-200">
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
              {/* Remove camera button since profile pic comes from Google */}
            </div>
          </div>

          {/* Name Display (Read-only from Google) */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name</label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <span className="text-2xl">😊</span>
              <input
                type="text"
                value={name}
                readOnly
                placeholder="Name from Google"
                className="flex-1 bg-transparent outline-none text-gray-800 font-medium cursor-not-allowed"
              />
              <span className="text-xs text-gray-400">✓</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-1">From your Google account</p>
          </div>

          {/* Birthday Display (Read-only from Google or manual input if not available) */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Date of Birth</label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Cake className="w-5 h-5 text-pink-500" />
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                placeholder="01/01/2000"
                className="flex-1 bg-transparent outline-none text-gray-800 font-medium"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              />
            </div>
            {!birthday && (
              <p className="text-xs text-orange-500 mt-1 ml-1">⚠️ Please enter your date of birth</p>
            )}
          </div>

          {/* Gender Selection - ONLY EDITABLE FIELD */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Select Your Gender *</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedGender('male')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedGender === 'male'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105 ring-4 ring-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-3xl">👨</span>
                <span>Guy</span>
              </button>
              
              <button
                onClick={() => setSelectedGender('female')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedGender === 'female'
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg scale-105 ring-4 ring-pink-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-3xl">👩</span>
                <span>Girl</span>
              </button>
            </div>
          </div>

          {/* Warning Text */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
            <p className="text-xs text-amber-800 text-center font-medium">
              ⚠️ You cannot change your gender or birthday after registration
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!selectedGender || !birthday}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 ${
              selectedGender && birthday
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-300 cursor-not-allowed opacity-50'
            }`}
          >
            {selectedGender && birthday ? 'Complete Registration' : 'Please Select Gender'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal