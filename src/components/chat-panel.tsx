"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, ShieldOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { aiChatAssistance } from "@/ai/flows/ai-chat-assistance";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  isLoading?: boolean;
};

type ChatPanelProps = {
  isChatEnabled: boolean;
};

export default function ChatPanel({ isChatEnabled }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !isChatEnabled) return;

    const userMessage: Message = { id: Date.now(), text: input, sender: "user" };
    const loadingMessage: Message = { id: Date.now() + 1, text: "", sender: "ai", isLoading: true };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");

    try {
      const result = await aiChatAssistance({ query: input });
      const aiMessage: Message = { id: Date.now() + 2, text: result.response, sender: "ai" };
      setMessages((prev) => [...prev.filter(m => !m.isLoading), aiMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "Could not get a response from the AI assistant.",
      });
      setMessages((prev) => prev.filter(m => !m.isLoading));
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col border-l bg-card/50 transition-all duration-300">
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Meeting Chat</h2>
        </div>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-transparent"><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[80%] shadow-sm",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent text-accent-foreground"><User className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {messages.length === 0 && isChatEnabled && (
                <div className="text-center text-muted-foreground pt-10">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">No messages yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Ask the AI assistant a question to get started.</p>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4 bg-card">
          {isChatEnabled ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={!isChatEnabled}
              />
              <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send Message">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-4 bg-muted rounded-lg">
                <ShieldOff className="h-8 w-8 mb-2" />
                <p className="font-semibold">Chat is disabled</p>
                <p className="text-sm">The host has currently disabled the chat.</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
