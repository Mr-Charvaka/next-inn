"use client";

import React, { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/app-header";
import DrawingCanvas from "@/components/drawing-canvas";
import ChatPanel from "@/components/chat-panel";
import ScreenShareView from "@/components/screen-share-view";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [participantCount, setParticipantCount] = useState(600);
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setParticipantCount((prevCount) => {
        const fluctuation = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const newCount = prevCount + fluctuation;
        return newCount > 500 ? newCount : 500 + Math.floor(Math.random() * 20); // Ensure count stays high
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScreenShareToggle = async () => {
    if (isScreenSharing) {
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenStream(stream);
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => {
            setScreenStream(null);
            setIsScreenSharing(false);
        };
      } catch (error) {
        console.error("Screen share error:", error);
        toast({
          variant: "destructive",
          title: "Screen Share Failed",
          description: "Could not start screen sharing. Please check permissions.",
        });
        setIsScreenSharing(false);
      }
    }
  };


  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <AppHeader
        participantCount={participantCount}
        isChatEnabled={isChatEnabled}
        onChatToggle={setIsChatEnabled}
        isScreenSharing={isScreenSharing}
        onScreenShareToggle={handleScreenShareToggle}
      />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
          <div className="relative flex-1 w-full h-full rounded-xl shadow-lg">
             {isScreenSharing && screenStream ? (
                <ScreenShareView stream={screenStream} />
             ) : (
                <DrawingCanvas />
             )}
          </div>
        </div>
        <ChatPanel isChatEnabled={isChatEnabled} />
      </main>
    </div>
  );
}
