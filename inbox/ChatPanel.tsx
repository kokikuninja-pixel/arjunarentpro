'use client';
import {
  collection,
  query,
  orderBy,
  doc,
  addDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Conversation, Message } from '@/lib/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

interface ChatPanelProps {
  conversationId: string;
}

export function ChatPanel({ conversationId }: ChatPanelProps) {
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationRef = useMemoFirebase(
    () => doc(firestore, 'conversations', conversationId),
    [firestore, conversationId]
  );
  const { data: conversation, isLoading: isConversationLoading } = useDoc<Conversation>(conversationRef);

  const messagesQuery = useMemoFirebase(
    () => query(collection(firestore, 'conversations', conversationId, 'messages'), orderBy('timestamp', 'asc')),
    [firestore, conversationId]
  );
  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!user || !text.trim() || !conversation) return;

    const newMessage: Omit<Message, 'id' | 'timestamp'> = {
      text,
      sender: 'staff',
      staffId: user.uid,
    };

    try {
      const batch = writeBatch(firestore);
      const messagesColRef = collection(firestore, 'conversations', conversationId, 'messages');
      const newMessageRef = doc(messagesColRef);

      batch.set(newMessageRef, { ...newMessage, timestamp: serverTimestamp() });

      const convoRef = doc(firestore, 'conversations', conversationId);
      batch.update(convoRef, {
        lastMessageSnippet: text,
        lastMessageAt: serverTimestamp(),
        status: 'open',
        unread: false, // staff sending message marks it as read
      });

      await batch.commit();

      toast({
          title: "Pesan Terkirim (Simulasi)",
          description: "Pesan Anda telah disimpan di database. Hubungkan ke API untuk pengiriman nyata."
      })
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
          variant: 'destructive',
          title: "Gagal Mengirim Pesan"
      })
    }
  };

  const getInitials = (name: string | undefined) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'C';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 p-3 border-b">
        {isConversationLoading ? (
            <>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </>
        ) : conversation ? (
            <>
            <Avatar className="h-10 w-10 border">
                <AvatarImage src={(conversation as any).avatarUrl} alt={conversation.customerName} />
                <AvatarFallback>{getInitials(conversation.customerName)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{conversation.customerName}</p>
                <p className="text-sm text-muted-foreground">{conversation.customerPhone}</p>
            </div>
            </>
        ) : null}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {areMessagesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/5" />
            <Skeleton className="h-16 w-4/5 ml-auto" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ) : (
            <>
            {messages?.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
            </>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
