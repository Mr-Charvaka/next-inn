import React, { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AppHeader() {
  const [participantCount, setParticipantCount] = useState(600);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const participantInterval = setInterval(() => {
      setParticipantCount((prevCount) => {
        const fluctuation = Math.floor(Math.random() * 21) - 10;
        const newCount = prevCount + fluctuation;
        return newCount > 500 ? newCount : 500 + Math.floor(Math.random() * 20);
      });
    }, 3000);

    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Initial check
    handleOnlineStatus();

    return () => {
      clearInterval(participantInterval);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 bg-card">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium text-red-500">REC</span>
        <span className="text-sm text-muted-foreground ml-2">00:12:34</span>
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
        <Button variant="destructive">End Call</Button>
      </div>
    </header>
  );
}
