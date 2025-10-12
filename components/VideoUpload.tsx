"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";

interface Props {
  onUpload: (url: string) => void;
  videoBlob?: Blob | null;
}

export default function VideoUpload({ onUpload, videoBlob }: Props) {
  const [video, setVideo] = useState<File | Blob | null>(videoBlob || null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!video) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', video);
      const response = await axiosInstance.post('/auth/upload-verification-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpload(response.data.videoUrl);
      alert("Video uploaded successfully!");
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert("Upload failed: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm text-gray-600">Upload verification video</label>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideo(e.target.files?.[0] || null)}
      />
      <Button
        type="button"
        onClick={handleUpload}
        disabled={uploading || !video}
        className="bg-red-700 hover:bg-red-600"
      >
        {uploading ? "Uploading..." : "Upload Video"}
      </Button>
    </div>
  );
}
