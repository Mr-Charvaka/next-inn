import React, { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type AppHeaderProps = {
  isRecording: boolean;
  onRecordingToggle: () => void;
  onEndCall: () => void;
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function AppHeader({ isRecording, onRecordingToggle, onEndCall }: AppHeaderProps) {
  const [participantCount, setParticipantCount] = useState(800);
  const [isOnline, setIsOnline] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    handleOnlineStatus();

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 bg-card">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onRecordingToggle}>
        <div className={cn("w-3 h-3 rounded-full bg-red-500", isRecording && "animate-pulse")} />
        <span className="text-sm font-medium text-red-500">REC</span>
        <span className="text-sm text-muted-foreground ml-2 tabular-nums">{formatTime(elapsedTime)}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">SimuMeet</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5" />
          <span className="font-medium">{participantCount}</span>
        </div>
        <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-2">
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {isOnline ? 'Connected' : 'Offline'}
        </Badge>
        <Button variant="destructive" onClick={onEndCall}>End Call</Button>
      </div>
    </header>
  );
}
