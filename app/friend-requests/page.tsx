"use client";
import React, { useState, useEffect } from "react";
import { useFriends } from "@/hooks/useFriends";
import { UserPlus, Check, X, Users } from "lucide-react";


const FriendRequestsPage = () => {
  const { incomingRequests, loading, acceptFriendRequest, rejectFriendRequest, fetchFriends } = useFriends();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAccept = async (friendId: string) => {
    setProcessing(friendId);
    try {
      await acceptFriendRequest(friendId);
      // Refresh the list after accepting
      setTimeout(() => {
        fetchFriends();
      }, 500);
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (friendId: string) => {
    setProcessing(friendId);
    try {
      await rejectFriendRequest(friendId);
      // Refresh the list after rejecting
      setTimeout(() => {
        fetchFriends();
      }, 500);
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#5940df] rounded-lg">
      
      <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Friend Requests</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-red-500"></div>
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-white text-base sm:text-lg">No pending friend requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((request) => {
                const friendUser = request.user;
                const friendId = friendUser._id;
                const isProcessing = processing === friendId;

                return (
                  <div
                    key={friendId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg bg-[#845dfa] transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 mb-4 sm:mb-0">
                      {/* Profile Picture or Avatar */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {friendUser.profilePicture ? (
                          <img
                            src={friendUser.profilePicture}
                            alt={`${friendUser.firstName || ''} ${friendUser.lastName || ''}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`text-red-500 font-semibold text-sm sm:text-lg ${friendUser.profilePicture ? 'hidden' : ''}`}>
                          {(friendUser.firstName?.[0] || friendUser.email?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {friendUser.firstName && friendUser.lastName
                            ? `${friendUser.firstName} ${friendUser.lastName}`
                            : friendUser.firstName
                            ? friendUser.firstName
                            : friendUser.email}
                        </h3>
                        {/* {friendUser.email && (
                          <p className="text-sm text-gray-500">{friendUser.email}</p>
                        )} */}
                        {friendUser.role && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            {friendUser.role}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 justify-center md:justify-end">
                      <button
                        onClick={() => handleAccept(friendId)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(friendId)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default FriendRequestsPage;

