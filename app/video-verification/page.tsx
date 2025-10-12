"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoRecording } from "@/components/VideoRecording";
import VideoUpload from "@/components/VideoUpload";

export default function VideoVerificationPage() {
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleVideoRecorded = (blob: Blob) => {
    setVideoBlob(blob);
  };

  const handleUploadSuccess = (url: string) => {
    // Video uploaded, redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Video Verification</h1>
        <p className="text-gray-600 mb-6 text-center">
          Please record or upload a verification video to complete your registration.
        </p>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Record Video</h2>
            <VideoRecording onVideoRecorded={handleVideoRecorded} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Or Upload Video File</h2>
            <VideoUpload onUpload={handleUploadSuccess} videoBlob={videoBlob} />
          </div>
        </div>
      </div>
    </div>
  );
}
