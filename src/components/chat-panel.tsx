"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { aiChatAssistance } from "@/ai/flows/ai-chat-assistance";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  isLoading?: boolean;
};

export default function ChatPanel() {
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
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now(), text: input, sender: "user" };
    const loadingMessage: Message = { id: Date.now() + 1, text: "", sender: "ai", isLoading: true };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    scrollToBottom();

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
    <div className="flex flex-col h-full bg-card">
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Meeting Chat</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          AI Enabled
        </Badge>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "ai" && (
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20"><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "rounded-lg p-3 max-w-[85%] text-sm",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                  </div>
                ) : (
                  <p className="leading-relaxed">{message.text}</p>
                )}
              </div>
              {message.sender === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground"><User className="w-5 h-5" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {messages.length === 0 && (
              <div className="text-center text-muted-foreground pt-10 flex flex-col items-center">
                  <MessageSquare className="h-10 w-10 mb-2" />
                  <h3 className="text-sm font-medium text-foreground">Chat is empty</h3>
                  <p className="text-xs text-muted-foreground">Ask the AI assistant a question to get started.</p>
              </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-muted focus-visible:ring-primary"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send Message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
