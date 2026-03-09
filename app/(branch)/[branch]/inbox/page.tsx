'use client';

import { useState } from 'react';
import { ConversationList } from '@/components/inbox/ConversationList';
import { ChatPanel } from '@/components/inbox/ChatPanel';
import { MessageSquare } from 'lucide-react';

export default function InboxPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-12rem)] border rounded-lg bg-card overflow-hidden">
      <div className="w-full md:w-1/3 lg:w-1/4 border-r overflow-y-auto">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>
      <div className="hidden md:flex flex-1 flex-col">
        {selectedConversationId ? (
          <ChatPanel conversationId={selectedConversationId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4" />
            <h2 className="text-xl font-semibold">Pilih percakapan</h2>
            <p className="max-w-xs">
              Pilih percakapan dari daftar di sebelah kiri untuk melihat pesan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
