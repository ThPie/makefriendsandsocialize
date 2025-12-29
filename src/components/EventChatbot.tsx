import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import chatbotAvatar from '@/assets/chatbot-avatar.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-assistant`;

// Context-aware greetings based on page location
const getGreeting = (pathname: string): Message => {
  if (pathname.startsWith('/portal')) {
    return {
      role: 'assistant',
      content: "Hey there! 👋 I'm your member concierge. Need help with your profile, upcoming events, or finding connections? I'm here for you!",
    };
  }
  if (pathname.startsWith('/admin')) {
    return {
      role: 'assistant',
      content: "Hello Admin! I can help you navigate the dashboard, manage members, or answer questions about platform features.",
    };
  }
  if (pathname.startsWith('/events')) {
    return {
      role: 'assistant',
      content: "Welcome! Looking for the perfect event? Tell me what interests you and I'll help you find curated gatherings that match your style.",
    };
  }
  if (pathname.startsWith('/slow-dating') || pathname.startsWith('/dating')) {
    return {
      role: 'assistant',
      content: "Welcome to Slow Dating! 💕 I can answer questions about our matchmaking process, how dates work, or help you get started.",
    };
  }
  if (pathname.startsWith('/membership')) {
    return {
      role: 'assistant',
      content: "Thinking about joining? I can explain our membership tiers, benefits, and help you find the right fit for your lifestyle.",
    };
  }
  // Default public greeting
  return {
    role: 'assistant',
    content: "Welcome to Make Friends and Socialize! I'm your assistant. How can I help you discover our community and events today?",
  };
};

// Context-aware chatbot config
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([getGreeting(location.pathname)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastPathRef = useRef(location.pathname);

  const chatConfig = getChatbotConfig(location.pathname);

  // Reset messages when navigating to a different section
  useEffect(() => {
    const currentSection = location.pathname.split('/')[1];
    const lastSection = lastPathRef.current.split('/')[1];
    
    if (currentSection !== lastSection) {
      setMessages([getGreeting(location.pathname)]);
    }
    lastPathRef.current = location.pathname;
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                if (last?.role === 'assistant' && prev.length > messages.length) {
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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center group overflow-hidden"
        aria-label="Open Assistant"
      >
        <img
          src={chatbotAvatar}
          alt="Assistant avatar"
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
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
            <div>
              <h3 className="font-bold font-display text-lg">{chatConfig.title}</h3>
              <p className="text-xs opacity-80">{chatConfig.subtitle}</p>
            </div>
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
                <span className="material-symbols-outlined text-lg">send</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
