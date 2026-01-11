import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { X, Volume2, VolumeX, Send } from 'lucide-react';
import chatbotAvatar from '@/assets/chatbot-avatar.webp';
import { useChatSound } from '@/hooks/useChatSound';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-assistant`;
const TEASER_DISMISSED_KEY = 'chatbot-teaser-dismissed';

// Short teaser messages for the bubble
const getTeaserMessage = (pathname: string): string => {
  if (pathname.startsWith('/portal')) {
    return "Need help with your membership?";
  }
  if (pathname.startsWith('/admin')) {
    return "Need dashboard assistance?";
  }
  if (pathname.startsWith('/events')) {
    return "Looking for the perfect event?";
  }
  if (pathname.startsWith('/slow-dating') || pathname.startsWith('/dating')) {
    return "Questions about Slow Dating?";
  }
  if (pathname.startsWith('/membership')) {
    return "Thinking about joining us?";
  }
  if (pathname.startsWith('/connected-circle')) {
    return "Explore our business network?";
  }
  if (pathname.startsWith('/faq')) {
    return "Can't find your answer?";
  }
  return "Want to learn more about our community?";
};

// Full greetings for the chat window
const getGreeting = (pathname: string, userName?: string | null): Message => {
  const personalName = userName ? `, ${userName}` : '';
  
  if (pathname.startsWith('/portal')) {
    return {
      role: 'assistant',
      content: `Hey${personalName}! 👋 I'm your member concierge. Need help with your profile, upcoming events, or finding connections? I'm here for you!`,
    };
  }
  if (pathname.startsWith('/admin')) {
    return {
      role: 'assistant',
      content: `Hello${personalName}! I can help you navigate the dashboard, manage members, or answer questions about platform features.`,
    };
  }
  if (pathname.startsWith('/events')) {
    return {
      role: 'assistant',
      content: `Welcome${personalName}! Looking for the perfect event? Tell me what interests you and I'll help you find curated gatherings that match your style.`,
    };
  }
  if (pathname.startsWith('/slow-dating') || pathname.startsWith('/dating')) {
    return {
      role: 'assistant',
      content: `Welcome to Slow Dating${personalName}! 💕 I can answer questions about our matchmaking process, how dates work, or help you get started.`,
    };
  }
  if (pathname.startsWith('/membership')) {
    return {
      role: 'assistant',
      content: `Hi${personalName}! Thinking about joining? I can explain our membership tiers, benefits, and help you find the right fit for your lifestyle.`,
    };
  }
  if (pathname.startsWith('/faq')) {
    return {
      role: 'assistant',
      content: `Hi${personalName}! 👋 Looking for answers? I can help you find what you need or answer any questions not covered in our FAQ.`,
    };
  }
  return {
    role: 'assistant',
    content: `Welcome to Make Friends and Socialize${personalName}! 👋 I'm here to help you discover our community. Have any questions about our events or membership?`,
  };
};

const getChatbotConfig = (pathname: string) => {
  if (pathname.startsWith('/portal')) {
    return { title: 'Member Concierge', subtitle: 'Here to help you' };
  }
  if (pathname.startsWith('/admin')) {
    return { title: 'Admin Assistant', subtitle: 'Platform support' };
  }
  return { title: 'Event Assistant', subtitle: 'Ask me anything' };
};

export const EventChatbot = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const userName = profile?.first_name || null;
  
  // Chat states
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTeaser, setShowTeaser] = useState(() => {
    return sessionStorage.getItem(TEASER_DISMISSED_KEY) !== 'true';
  });
  const [isTypingTeaser, setIsTypingTeaser] = useState(true);
  const [teaserMessage, setTeaserMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([getGreeting(location.pathname, userName)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPathRef = useRef(location.pathname);
  const prevMessagesLengthRef = useRef(messages.length);
  
  const { isMuted, toggleMute, playMessageSound } = useChatSound();
  const chatConfig = getChatbotConfig(location.pathname);

  // Typing animation effect for teaser
  useEffect(() => {
    if (showTeaser && sessionStorage.getItem(TEASER_DISMISSED_KEY) !== 'true') {
      setIsTypingTeaser(true);
      const timer = setTimeout(() => {
        setIsTypingTeaser(false);
        setTeaserMessage(getTeaserMessage(location.pathname));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showTeaser, location.pathname]);

  // Update greeting when user profile loads
  useEffect(() => {
    if (userName && messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([getGreeting(location.pathname, userName)]);
    }
  }, [userName, location.pathname, messages]);

  // Reset messages when navigating to a different section
  useEffect(() => {
    const currentSection = location.pathname.split('/')[1];
    const lastSection = lastPathRef.current.split('/')[1];
    
    if (currentSection !== lastSection) {
      setMessages([getGreeting(location.pathname, userName)]);
      // Reset teaser for new section if not dismissed
      if (sessionStorage.getItem(TEASER_DISMISSED_KEY) !== 'true') {
        setShowTeaser(true);
        setIsTypingTeaser(true);
      }
    }
    lastPathRef.current = location.pathname;
  }, [location.pathname, userName]);

  // Play sound and increment badge on new assistant message when closed
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant' && !isExpanded) {
        playMessageSound();
        setUnreadCount(prev => prev + 1);
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isExpanded, playMessageSound]);

  // Clear unread count when opening chat
  useEffect(() => {
    if (isExpanded) {
      setUnreadCount(0);
    }
  }, [isExpanded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDismissTeaser = useCallback(() => {
    sessionStorage.setItem(TEASER_DISMISSED_KEY, 'true');
    setShowTeaser(false);
  }, []);

  const handleAvatarClick = useCallback(() => {
    setIsExpanded(true);
    setShowTeaser(false);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > newMessages.length) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble responding right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Collapsed/Teaser State */}
      {!isExpanded && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">
          {/* Speech Bubble with typing/message */}
          {showTeaser && (
            <div className="relative bg-gradient-to-br from-secondary via-card to-accent/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 max-w-[280px] shadow-2xl animate-fade-in">
              {/* Dismiss button */}
              <button 
                onClick={handleDismissTeaser}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              
              {/* Content: typing dots or message */}
              {isTypingTeaser ? (
                <div className="flex items-center gap-1.5 py-1 pr-4">
                  <span 
                    className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                    style={{ animationDelay: '0ms' }} 
                  />
                  <span 
                    className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                    style={{ animationDelay: '150ms' }} 
                  />
                  <span 
                    className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                    style={{ animationDelay: '300ms' }} 
                  />
                </div>
              ) : (
                <p className="text-foreground text-sm leading-relaxed pr-4 animate-fade-in">
                  {teaserMessage}
                </p>
              )}
              
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-accent/80 border-r border-b border-primary/20 rotate-45" />
            </div>
          )}
          
          {/* Floating Avatar Button with notification badge */}
          <button 
            onClick={handleAvatarClick}
            className={`relative w-14 h-14 rounded-full overflow-hidden border-2 shadow-xl transition-all duration-300 hover:scale-105 touch-manipulation ${
              unreadCount > 0 
                ? 'border-primary shadow-[0_0_20px_hsl(45_80%_55%/0.4)] animate-pulse' 
                : 'border-border hover:border-primary'
            }`}
            aria-label="Open chat assistant"
          >
            <img 
              src={chatbotAvatar} 
              alt="Assistant" 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Expanded Chat Window */}
      {isExpanded && (
        <div className="fixed bottom-4 right-2 md:bottom-6 md:right-6 z-50 w-[calc(100vw-1rem)] md:w-[360px] max-w-[400px] h-[60vh] md:h-[500px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary-foreground/20">
              <img
                src={chatbotAvatar}
                alt="Assistant avatar"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold font-display text-lg">{chatConfig.title}</h3>
              <p className="text-xs opacity-80">{chatConfig.subtitle}</p>
            </div>
            
            {/* Sound Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
              aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            
            {/* Close Button */}
            <button
              onClick={handleCloseChat}
              className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-2.5 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-full bg-muted border-none text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-full w-10 h-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
