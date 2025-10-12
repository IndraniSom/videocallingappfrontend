import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface VideoRecordingProps {
  onVideoRecorded: (videoBlob: Blob) => void;
}

const VideoRecording = ({ onVideoRecorded }: VideoRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
        onVideoRecorded(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        className="w-full max-w-md h-64 bg-gray-100 rounded-lg"
        autoPlay
        muted
        playsInline
      />
      {recordedVideo && (
        <video
          className="w-full max-w-md h-64 bg-gray-100 rounded-lg"
          src={recordedVideo}
          controls
        />
      )}
      <div className="flex gap-4">
        {!isRecording ? (
          <Button
            type="button"
            onClick={startRecording}
            className="bg-red-700 hover:bg-red-600"
          >
            Start Recording
          </Button>
        ) : (
          <Button
            type="button"
            onClick={stopRecording}
            className="bg-gray-700 hover:bg-gray-600"
          >
            Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
};

export { VideoRecording };