"use client";

import React, { useState } from "react";
import AppHeader from "@/components/app-header";
import DrawingCanvas from "@/components/drawing-canvas";
import ChatPanel from "@/components/chat-panel";
import ScreenShareView from "@/components/screen-share-view";
import { useToast } from "@/hooks/use-toast";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Video, Edit3, MessageCircle, ScreenShare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ViewMode = "video" | "draw" | "share";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("video");
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const handleScreenShareToggle = async () => {
    if (viewMode === 'share') {
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setViewMode('video');
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        stream.getVideoTracks()[0].onended = () => {
            setScreenStream(null);
            setViewMode('video');
        };
        setScreenStream(stream);
        setViewMode('share');
      } catch (error) {
        console.error("Screen share error:", error);
        toast({
          variant: "destructive",
          title: "Screen Share Failed",
          description: "Could not start screen sharing. Please check permissions.",
        });
        setViewMode('video');
      }
    }
  };

  const renderView = () => {
    switch(viewMode) {
      case 'share':
        return screenStream ? <ScreenShareView stream={screenStream} /> : <div className="flex items-center justify-center h-full text-muted-foreground">No screen share stream.</div>;
      case 'draw':
        return <DrawingCanvas />;
      case 'video':
      default:
        // Placeholder for video grid
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full overflow-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg flex items-center justify-center aspect-video">
                <Users className="w-16 h-16 text-muted-foreground" />
              </div>
            ))}
          </div>
        );
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <nav className="flex flex-col items-center gap-4 py-4 px-2 bg-card border-r">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'video' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('video')}>
                  <Video className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Video Grid</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'draw' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('draw')}>
                  <Edit3 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Whiteboard</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={viewMode === 'share' ? 'secondary' : 'ghost'} size="icon" onClick={handleScreenShareToggle}>
                  <ScreenShare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Screen Share</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mt-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={isChatOpen ? 'secondary' : 'ghost'} size="icon" onClick={() => setIsChatOpen(!isChatOpen)}>
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Toggle Chat</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </nav>
        <main className="flex-1 flex flex-col">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={75}>
              <div className="flex-1 h-full">
                {renderView()}
              </div>
            </ResizablePanel>
            {isChatOpen && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                  <ChatPanel />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
}
