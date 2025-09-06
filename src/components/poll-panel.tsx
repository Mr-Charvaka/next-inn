"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X, BarChart2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

type PollOption = {
  id: number;
  text: string;
  votes: number;
};

type Poll = {
  id: number;
  question: string;
  options: PollOption[];
  voted: boolean;
};

export default function PollPanel() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState<string[]>(['', '']);

  const handleAddOption = () => {
    if (newPollOptions.length < 5) {
      setNewPollOptions([...newPollOptions, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (newPollOptions.length > 2) {
      const updatedOptions = [...newPollOptions];
      updatedOptions.splice(index, 1);
      setNewPollOptions(updatedOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newPollOptions];
    updatedOptions[index] = value;
    setNewPollOptions(updatedOptions);
  };

  const handleCreatePoll = () => {
    if (newPollQuestion.trim() && newPollOptions.every(opt => opt.trim())) {
      const newPoll: Poll = {
        id: Date.now(),
        question: newPollQuestion,
        options: newPollOptions.map((opt, i) => ({ id: i, text: opt, votes: 0 })),
        voted: false,
      };
      setPolls([newPoll, ...polls]);
      setNewPollQuestion('');
      setNewPollOptions(['', '']);
    }
  };

  const handleVote = (pollId: number, optionId: number) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId && !poll.voted) {
        const newOptions = poll.options.map(option => {
          if (option.id === optionId) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });
        return { ...poll, options: newOptions, voted: true };
      }
      return poll;
    }));
  };
  
  const handleDeletePoll = (pollId: number) => {
    setPolls(polls.filter(poll => poll.id !== pollId));
  }

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((total, option) => total + option.votes, 0);
  }

  return (
    <div className="flex flex-col h-full bg-card border-l">
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Polls</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-base">Create a New Poll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Poll Question"
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
              />
              <div className="space-y-2">
                {newPollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(index)} disabled={newPollOptions.length <= 2}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleAddOption} disabled={newPollOptions.length >= 5}>
                <Plus className="mr-2 h-4 w-4" /> Add Option
              </Button>
              <Button onClick={handleCreatePoll} disabled={!newPollQuestion.trim() || newPollOptions.some(opt => !opt.trim())}>
                Create Poll
              </Button>
            </CardFooter>
          </Card>

          {polls.length > 0 ? (
            polls.map(poll => {
              const totalVotes = getTotalVotes(poll);
              return (
              <Card key={poll.id} className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-base flex justify-between items-center">
                    {poll.question}
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePoll(poll.id)}>
                      <Trash2 className="h-4 w-4 text-destructive/80" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {poll.options.map(option => {
                    const votePercentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    return (
                        <div key={option.id}>
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-medium">{option.text}</span>
                                <span className="text-muted-foreground">{option.votes} vote(s)</span>
                            </div>
                           {poll.voted ? (
                             <Progress value={votePercentage} className="h-3"/>
                           ) : (
                             <Button size="sm" variant="outline" className="w-full" onClick={() => handleVote(poll.id, option.id)}>Vote</Button>
                           )}
                        </div>
                    );
                  })}
                </CardContent>
              </Card>
            )})
          ) : (
            <div className="text-center text-muted-foreground pt-10 flex flex-col items-center">
              <BarChart2 className="h-10 w-10 mb-2" />
              <h3 className="text-sm font-medium text-foreground">No active polls</h3>
              <p className="text-xs text-muted-foreground">Create a poll to get started.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
