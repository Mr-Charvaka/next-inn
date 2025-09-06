import React, { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';

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
      <div className="flex items-center gap-4">
        <div className="font-bold text-lg">SimuMeet</div>
        <div className="flex items-center gap-2 cursor-pointer" onClick={onRecordingToggle}>
          <div className={cn("w-3 h-3 rounded-full bg-red-500", isRecording && "animate-pulse")} />
          <span className="text-sm font-medium text-red-500">REC</span>
          <span className="text-sm text-muted-foreground ml-2 tabular-nums">{formatTime(elapsedTime)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5" />
          <span className="font-medium text-sm">{participantCount}</span>
        </div>
        <Badge variant={isOnline ? 'outline' : 'destructive'} className="gap-2 border-green-500/50 text-green-400">
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {isOnline ? 'Connected' : 'Offline'}
        </Badge>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon"><Settings/></Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Settings</h4>
                        <p className="text-sm text-muted-foreground">
                            Customize your meeting experience.
                        </p>
                    </div>
                    <Separator/>
                     <div className="grid gap-2">
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label htmlFor="mic-control">Microphone</Label>
                            <Switch id="mic-control" defaultChecked/>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label htmlFor="cam-control">Camera</Label>
                            <Switch id="cam-control" defaultChecked/>
                        </div>
                         <div className="grid grid-cols-2 items-center gap-4">
                            <Label htmlFor="notif-control">Notifications</Label>
                            <Switch id="notif-control" defaultChecked/>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
        <Button variant="destructive" onClick={onEndCall}>End Call</Button>
      </div>
    </header>
  );
}
