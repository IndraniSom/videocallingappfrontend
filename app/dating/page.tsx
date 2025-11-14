"use client";
import { useFriends } from "@/hooks/useFriends";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function FriendsPage() {
  const {
    users,
    friends,
    incomingRequests,
    sendFriendRequest,
    loading,
  } = useFriends();

  const [skippedUsers, setSkippedUsers] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [dragX, setDragX] = useState(0);

  // ✅ Swipe handler logic
  const handleSwipe = async (direction: "left" | "right", userId: string) => {
    if (direction === "left") {
      await sendFriendRequest(userId);
      setSentRequests((prev) => [...prev, userId]);
    } else if (direction === "right") {
      setSkippedUsers((prev) => [...prev, userId]);
    }
  };

  // ✅ Filter logic
  const filteredUsers = users.filter(
    (u) =>
      !friends.some((f) => f.user._id === u._id) &&
      !incomingRequests.some((r) => r.user._id === u._id) &&
      !skippedUsers.includes(u._id) &&
      !sentRequests.includes(u._id)
  );
  console.log("Filtered Users:", filteredUsers);
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 to-pink-900 text-black flex flex-col items-center overflow-hidden relative">
      {/* Header */}
      {/* <div className="absolute top-0 left-0 right-0 p-4 bg-gray-900 border-b border-gray-800 text-center text-2xl font-bold shadow-lg">
        💞 Discover New Friends
      </div> */}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 mt-20">
          <Loader2 className="animate-spin w-5 h-5" /> Loading suggestions...
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-gray-400 mt-20 text-lg">
          No more users to show 💤
        </p>
      ) : (
        <div className="relative w-full h-[85vh] flex items-center justify-center">
          <AnimatePresence>
            {filteredUsers.map((user, index) => {
              const imageUrl = `https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e`;
              const isTopCard = index === 0;
              
              return (
                <motion.div
                  key={user._id}
                  className="absolute w-[90%] sm:w-[400px] h-[70vh] bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-end border border-gray-700 cursor-grab select-none"
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  whileTap={isTopCard ? { scale: 0.97 } : {}}
                  onDrag={(e, info) => {
                    if (isTopCard) {
                      setDragX(info.offset.x);
                    }
                  }}
                  onDragEnd={(e, info) => {
                    setDragX(0);
                    if (info.offset.x < -120) {
                      handleSwipe("left", user._id); // 👈 Send request
                    } else if (info.offset.x > 120) {
                      handleSwipe("right", user._id); // 👉 Skip
                    }
                  }}
                  style={{
                    zIndex: filteredUsers.length - index,
                  }}
                  initial={{ 
                    scale: 1 - index * 0.05, 
                    opacity: 1, 
                    y: index * 10,
                    x: index === 1 ? -15 : index === 2 ? 15 : 0,
                    rotate: index === 1 ? -2 : index === 2 ? 2 : 0
                  }}
                  animate={{ 
                    scale: 1 - index * 0.05,
                    y: index * 10,
                    x: index === 1 ? -15 : index === 2 ? 15 : 0,
                    rotate: index === 1 ? -2 : index === 2 ? 2 : 0
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  {/* Background Image */}
                  <img
                    src={imageUrl}
                    alt={`${user.firstName}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Swipe Indicators */}
                  {isTopCard && (
                    <>
                      {/* Friend Request Sent - Left Swipe */}
                      <motion.div
                        className="absolute top-20 left-10 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg border-4 border-white"
                        initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                        animate={{ 
                          opacity: dragX < -50 ? 1 : 0,
                          scale: dragX < -50 ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        ✓ FRIEND REQUEST
                      </motion.div>

                      {/* Rejected - Right Swipe */}
                      <motion.div
                        className="absolute top-20 right-10 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg border-4 border-white"
                        initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
                        animate={{ 
                          opacity: dragX > 50 ? 1 : 0,
                          scale: dragX > 50 ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        ✗ REJECTED
                      </motion.div>
                    </>
                  )}

                  {/* User Info */}
                  <div className="relative z-10 p-5 text-left">
                    <h3 className="text-xl font-bold text-gray-300">
                      {user.firstName} {user.lastName}
                    </h3>
                    
                    <p className="text-sm text-gray-400 italic mt-1">
                      {user.role === "male" ? "♂ Male" : "♀ Female"}
                    </p>

                    {/* <div className="flex justify-between mt-6">
                      <p className="text-xs text-gray-500">
                        👈 Swipe left to send friend request
                      </p>
                      <p className="text-xs text-gray-500">
                        👉 Swipe right to skip
                      </p>
                    </div> */}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Background gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
    </div>
  );
}