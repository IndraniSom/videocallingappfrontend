import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
export default function Hero2() {
  return (
    <div className="min-h-fit bg-white w-full">
     
      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 ">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-pink-500">Best platform</span>
              <span className="text-gray-900"> For Random Video Chat with Pretty Girls</span>
            </h1>
            
            <p className="text-xl text-gray-600">
                Discover exciting conversations and connections with beautiful girls.Try our random video chat platform now!
            </p>

            <Link href="/signup" className="space-y-3">
              <button className="w-full sm:w-auto px-8 py-4 bg-red-400 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                GET FREE TRIAL NOW
              </button>
              
            </Link>
          </div>

          {/* Right Column - Images Grid */}
          <Image src="https://res.cloudinary.com/dhjzu51mb/image/upload/v1760272023/h3ox9ndkb4rqdmllrvsi.png" alt="Image 1" width={400} height={80} className="w-full h-full rounded-full object-cover " />
        </div>
      </main>

      
    </div>
  );
}