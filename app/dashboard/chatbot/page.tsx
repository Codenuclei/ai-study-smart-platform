'use client';

import { useChat } from '@ai-sdk/react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DefaultChatTransport } from 'ai';
import { Send, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ChatbotPage() {
  const { messages, input, setInput, append, isLoading, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    await append({ role: 'user', content: input });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col">
          <div className="container max-w-3xl py-8 px-4 sm:px-6 lg:px-8 flex flex-col h-full">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Study Chatbot</h1>
              <p className="text-muted-foreground mt-2">
                Ask questions about your study materials and get instant help from our AI tutor
              </p>
            </div>

            {/* Chat Container */}
            <Card className="flex-1 flex flex-col p-6 overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Start Your Learning Journey</h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Ask me anything about your study materials. I can help you understand concepts, answer questions, and guide your learning.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-sm">
                      <button
                        onClick={() => setInput('Can you explain the concept of photosynthesis?')}
                        className="p-3 rounded-lg border border-border/40 hover:bg-muted text-left transition"
                      >
                        💡 Explain a concept
                      </button>
                      <button
                        onClick={() => setInput('What are the key points I should remember?')}
                        className="p-3 rounded-lg border border-border/40 hover:bg-muted text-left transition"
                      >
                        📝 Summarize topics
                      </button>
                      <button
                        onClick={() => setInput('How do I solve this type of problem?')}
                        className="p-3 rounded-lg border border-border/40 hover:bg-muted text-left transition"
                      >
                        🔢 Problem solving
                      </button>
                      <button
                        onClick={() => setInput('What revision strategies do you recommend?')}
                        className="p-3 rounded-lg border border-border/40 hover:bg-muted text-left transition"
                      >
                        🎯 Study tips
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">🤖</span>
                          </div>
                        )}
                        <div
                          className={`max-w-sm lg:max-w-md px-4 py-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                              : 'bg-muted text-foreground rounded-bl-none border border-border/40'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">🤖</span>
                        </div>
                        <div className="max-w-sm lg:max-w-md px-4 py-3 rounded-lg bg-muted text-foreground rounded-bl-none border border-border/40">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-border/40 pt-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  {isLoading ? (
                    <Button
                      onClick={() => stop()}
                      variant="outline"
                      size="icon"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
