"use client";

import React, { useRef, useEffect } from 'react';

type ScreenShareViewProps = {
  stream: MediaStream;
};

export default function ScreenShareView({ stream }: ScreenShareViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="w-full h-full bg-card p-4">
      <video
        ref={videoRef}
        className="w-full h-full object-contain rounded-lg"
        autoPlay
        playsInline
      />
    </div>
  );
}
