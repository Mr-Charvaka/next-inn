"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { Video, Edit3, MessageCircle, ScreenShare, Mic, MicOff, VideoOff, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type ViewMode = "video" | "draw" | "share";

type Participant = {
  id: number;
  name: string;
  image: string;
  isMicOn: boolean;
  isVideoOn: boolean;
};

const initialParticipants: Participant[] = [
  { id: 1, name: 'Aarav Sharma', image: '401', isMicOn: true, isVideoOn: false },
  { id: 2, name: 'Vivaan Singh', image: '402', isMicOn: false, isVideoOn: false },
  { id: 3, name: 'Aditya Kumar', image: '403', isMicOn: true, isVideoOn: false },
  { id: 4, name: 'Arjun Gupta', image: '404', isMicOn: true, isVideoOn: false },
  { id: 5, name: 'Sai Prasad', image: '405', isMicOn: true, isVideoOn: false },
  { id: 6, name: 'Reyansh Reddy', image: '406', isMicOn: false, isVideoOn: false },
  { id: 7, name: 'Krishna Kumar', image: '407', isMicOn: true, isVideoOn: false },
  { id: 8, name: 'Ishaan Patel', image: '408', isMicOn: true, isVideoOn: false },
  { id: 9, name: 'Anvi Sharma', image: '409', isMicOn: true, isVideoOn: false },
  { id: 10, name: 'Diya Singh', image: '410', isMicOn: false, isVideoOn: false },
  { id: 11, name: 'Saanvi Gupta', image: '411', isMicOn: true, isVideoOn: false },
  { id: 12, name: 'Aadhya Reddy', image: '412', isMicOn: true, isVideoOn: false },
];

const allParticipants: Participant[] = Array.from({ length: 800 }, (_, i) => {
    if (i < initialParticipants.length) return initialParticipants[i];
    return {
        id: i + 1,
        name: `Participant ${i + 1}`,
        image: `${413 + i}`,
        isMicOn: Math.random() > 0.5,
        isVideoOn: false,
    };
});

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("video");
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>(allParticipants);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
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

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" } as any,
        audio: true,
      });
      
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      recordedChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm; codecs=vp9'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SimuMeet-Recording-${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: "Recording Saved",
          description: "Your recording has been downloaded.",
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "The meeting is now being recorded.",
      });

    } catch (error) {
      console.error("Recording error:", error);
      toast({
        variant: "destructive",
        title: "Recording Failed",
        description: "Could not start recording. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const handleEndCall = () => {
    if (isRecording) {
      stopRecording();
    }
    setShowExitDialog(true);
  }

  const toggleMic = (id: number) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMicOn: !p.isMicOn } : p));
  };

  const toggleVideo = (id: number) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isVideoOn: !p.isVideoOn } : p));
  };
  
  const ParticipantCard = ({ participant }: { participant: Participant }) => (
    <div className="bg-card rounded-lg flex items-center justify-center aspect-video relative overflow-hidden group">
      {participant.isVideoOn ? (
        <Image 
          src={`https://picsum.photos/seed/${participant.image}/400/300`} 
          alt={participant.name} 
          width={400}
          height={300}
          data-ai-hint="person portrait"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
            <Avatar className="w-24 h-24">
                <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => toggleMic(participant.id)}>
          {participant.isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => toggleVideo(participant.id)}>
          {participant.isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-sm flex items-center gap-2">
        {participant.isMicOn ? <Mic className="h-4 w-4 text-green-400"/> : <MicOff className="h-4 w-4 text-red-500"/>}
        <span>{participant.name}</span>
      </div>
    </div>
  );

  const renderView = () => {
    switch(viewMode) {
      case 'share':
        return screenStream ? <ScreenShareView stream={screenStream} /> : <div className="flex items-center justify-center h-full text-muted-foreground">No screen share stream.</div>;
      case 'draw':
        return <DrawingCanvas />;
      case 'video':
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 h-full overflow-auto">
            {participants.slice(0, 11).map((p) => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
            <Dialog open={isParticipantListOpen} onOpenChange={setIsParticipantListOpen}>
              <DialogTrigger asChild>
                <div className="bg-card rounded-lg flex items-center justify-center aspect-video relative overflow-hidden group cursor-pointer hover:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <MoreHorizontal className="h-10 w-10" />
                        <span>View More</span>
                    </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>All Participants ({participants.length})</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-6">
                    {participants.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span>{p.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                              <Label htmlFor={`mic-switch-${p.id}`} className="text-sm">Mic</Label>
                              <Switch id={`mic-switch-${p.id}`} checked={p.isMicOn} onCheckedChange={() => toggleMic(p.id)} />
                          </div>
                          <div className="flex items-center gap-2">
                              <Label htmlFor={`video-switch-${p.id}`} className="text-sm">Video</Label>
                              <Switch id={`video-switch-${p.id}`} checked={p.isVideoOn} onCheckedChange={() => toggleVideo(p.id)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        );
    }
  }

  return (
    <>
      <div className="flex h-screen w-full flex-col bg-background text-foreground">
        <AppHeader 
          isRecording={isRecording} 
          onRecordingToggle={handleRecordingToggle}
          onEndCall={handleEndCall}
        />
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
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave the meeting? If you are recording, it will be stopped and saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => { /* In a real app, you would handle cleanup here */ setShowExitDialog(false); }}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
