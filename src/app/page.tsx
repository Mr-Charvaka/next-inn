"use client";

import React, { useState, useEffect } from "react";
import AppHeader from "@/components/app-header";
import DrawingCanvas from "@/components/drawing-canvas";
import ChatPanel from "@/components/chat-panel";

export default function Home() {
  const [participantCount, setParticipantCount] = useState(600);
  const [isChatEnabled, setIsChatEnabled] = useState(true);

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

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <AppHeader
        participantCount={participantCount}
        isChatEnabled={isChatEnabled}
        onChatToggle={setIsChatEnabled}
      />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
          <div className="relative flex-1 w-full h-full rounded-xl shadow-lg">
             <DrawingCanvas />
          </div>
        </div>
        <ChatPanel isChatEnabled={isChatEnabled} />
      </main>
    </div>
  );
}
