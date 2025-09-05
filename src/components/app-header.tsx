import React from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type AppHeaderProps = {
  participantCount: number;
  isChatEnabled: boolean;
  onChatToggle: (enabled: boolean) => void;
};

export default function AppHeader({
  participantCount,
  isChatEnabled,
  onChatToggle,
}: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6 z-10 bg-card">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">SimuMeet</h1>
      </div>
      <div className="ml-auto flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5" />
          <span className="font-medium">{participantCount}</span>
          <span className="hidden sm:inline text-muted-foreground">Participants</span>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="chat-toggle"
            checked={isChatEnabled}
            onCheckedChange={onChatToggle}
            aria-label="Toggle chat"
          />
          <Label htmlFor="chat-toggle" className="text-foreground cursor-pointer">
            Chat
          </Label>
        </div>
      </div>
    </header>
  );
}
