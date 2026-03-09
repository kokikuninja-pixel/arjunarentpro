'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ketik balasan..."
        className="flex-1"
        autoComplete="off"
      />
      <Button type="submit" size="icon" disabled={!text.trim()}>
        <Send className="h-4 w-4" />
        <span className="sr-only">Kirim</span>
      </Button>
    </form>
  );
}
