import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Message {
    id: string;
    match_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

interface MatchChatProps {
    matchId: string;
    userId: string;
    matchedName: string;
}

export const MatchChat = ({ matchId, userId, matchedName }: MatchChatProps) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const queryClient = useQueryClient();
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch messages
    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['match-messages', matchId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('match_messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as Message[];
        },
        enabled: !!matchId,
        refetchInterval: false,
    });

    // Subscribe to real-time messages
    useEffect(() => {
        const channel = supabase
            .channel(`match-chat-${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'match_messages',
                    filter: `match_id=eq.${matchId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    queryClient.setQueryData(
                        ['match-messages', matchId],
                        (old: Message[] | undefined) => {
                            if (!old) return [newMsg];
                            // Avoid duplicates (optimistic update may have already added it)
                            if (old.some(m => m.id === newMsg.id)) return old;
                            return [...old, newMsg];
                        }
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId, queryClient]);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        if (isExpanded) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isExpanded]);

    // Send message mutation
    const sendMutation = useMutation({
        mutationFn: async (content: string) => {
            const { data, error } = await supabase
                .from('match_messages')
                .insert({
                    match_id: matchId,
                    sender_id: userId,
                    content: content.trim(),
                })
                .select()
                .single();

            if (error) throw error;
            return data as Message;
        },
        onMutate: async (content) => {
            // Optimistic update
            const optimisticMsg: Message = {
                id: `temp-${Date.now()}`,
                match_id: matchId,
                sender_id: userId,
                content: content.trim(),
                created_at: new Date().toISOString(),
            };

            queryClient.setQueryData(
                ['match-messages', matchId],
                (old: Message[] | undefined) => [...(old || []), optimisticMsg]
            );

            return { optimisticMsg };
        },
        onError: (_err, _content, context) => {
            // Remove optimistic message on error
            if (context?.optimisticMsg) {
                queryClient.setQueryData(
                    ['match-messages', matchId],
                    (old: Message[] | undefined) =>
                        old?.filter(m => m.id !== context.optimisticMsg.id) || []
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['match-messages', matchId] });
        },
    });

    const handleSend = useCallback(() => {
        const text = newMessage.trim();
        if (!text || sendMutation.isPending) return;
        sendMutation.mutate(text);
        setNewMessage('');
        inputRef.current?.focus();
    }, [newMessage, sendMutation]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const unreadCount = messages.filter(m => m.sender_id !== userId).length;

    // Collapsed preview
    if (!isExpanded) {
        return (
            <Card
                className="border-dating-forest/20 cursor-pointer hover:border-dating-forest/40 transition-colors"
                onClick={() => setIsExpanded(true)}
            >
                <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dating-forest/10 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-dating-forest" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Chat with {matchedName}</p>
                            <p className="text-xs text-muted-foreground">
                                {messages.length === 0
                                    ? 'Start the conversation!'
                                    : `${messages.length} message${messages.length === 1 ? '' : 's'}`}
                            </p>
                        </div>
                    </div>
                    {messages.length > 0 && (
                        <div className="bg-dating-terracotta text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {messages.length}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-dating-forest/20">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-dating-forest" />
                    Chat with {matchedName}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-muted-foreground"
                >
                    Minimize
                </Button>
            </CardHeader>

            <CardContent className="p-0">
                {/* Messages area */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-dating-forest" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-full bg-dating-forest/10 flex items-center justify-center mb-4">
                                <MessageCircle className="h-8 w-8 text-dating-forest" />
                            </div>
                            <p className="text-foreground font-medium mb-1">Start the conversation!</p>
                            <p className="text-sm text-muted-foreground max-w-[250px]">
                                You both felt a connection. Say hello and see where it goes.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === userId;
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        'flex flex-col max-w-[80%]',
                                        isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                                            isMe
                                                ? 'bg-dating-forest text-white rounded-br-sm'
                                                : 'bg-muted text-foreground rounded-bl-sm'
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="border-t p-3 flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        maxLength={2000}
                        rows={1}
                        className={cn(
                            'flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm',
                            'focus:outline-none focus:ring-2 focus:ring-dating-forest/20 focus:border-dating-forest',
                            'placeholder:text-muted-foreground min-h-[40px] max-h-[120px]'
                        )}
                        style={{ height: 'auto', overflow: 'hidden' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                        }}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sendMutation.isPending}
                        className="bg-dating-forest hover:bg-dating-forest/90 text-white rounded-xl h-10 w-10 shrink-0"
                    >
                        {sendMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
