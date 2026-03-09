'use client';

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isStaff = message.sender === 'staff';

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'HH:mm');
    } catch (error) {
      return '';
    }
  };


  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isStaff ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-2',
          isStaff
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted rounded-bl-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p
          className={cn(
            'text-xs mt-1',
            isStaff ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
}