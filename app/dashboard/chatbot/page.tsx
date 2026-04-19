"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bot, User, Send, Sparkles, Loader2, Copy, Check, Trash2, FileText, Link as LinkIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import React from 'react';
import { SourceSelector } from '@/components/dashboard/source-selector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-8 h-8 rounded-lg transition-all absolute top-2 right-2 bg-white/50 dark:bg-black/80 backdrop-blur-sm border border-border/50 z-20 hover:bg-white/80 dark:hover:bg-black"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const isSendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Source Selection State for Chat
  const [activeContent, setActiveContent] = useState('');
  const [activeMaterialId, setActiveMaterialId] = useState<string | undefined>();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [showSourceDialog, setShowSourceDialog] = useState(false);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch('/api/user/chat');
        if (!response.ok) throw new Error('Failed to load history');
        const data = await response.json();
        const transformedMessages = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }));
        setMessages(transformedMessages);
      } catch (error) {
        toast.error('Could not load chat history');
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isSendingRef.current) return;

    const userContent = input.trim();
    setInput('');
    isSendingRef.current = true;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await fetch('/api/user/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          content: userContent,
          materialId: activeMaterialId,
        }),
      });

      // AI response includes context if a material is active
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: activeContent
              ? `[CONTEXT FROM DOCUMENT: ${activeLabel}]\n${activeContent}\n\n[USER QUESTION]\n${userContent}`
              : userContent
          }],
        }),
      });

      if (!aiResponse.ok) throw new Error('AI request failed');
      const data = await aiResponse.json();
      const aiContent = data.text || '';

      const assistantId = (Date.now() + 1).toString();
      const assistantMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

      const words = aiContent.split(/(\s+)/);
      let wordIdx = 0;
      const revealInterval = setInterval(() => {
        if (wordIdx < words.length) {
          const segment = words[wordIdx];
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + segment } : m
          ));
          wordIdx++;
          scrollToBottom();
        } else {
          clearInterval(revealInterval);
          fetch('/api/user/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'assistant',
              content: aiContent,
            }),
          });
          isSendingRef.current = false;
        }
      }, 1);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message.');
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Clear all chat messages?')) return;
    try {
      const res = await fetch('/api/user/chat', { method: 'DELETE' });
      if (res.ok) {
        setMessages([]);
        toast.success('Chat cleared');
      }
    } catch {
      toast.error('Failed to clear chat');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-foreground transition-colors duration-300">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
          </div>

          <div className="flex-1 flex flex-col h-full relative z-10 w-full">
            <div className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
              <div className="container max-w-7xl py-2 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <Bot
                        className="w-5 h-5 text-primary/60 animate-pulse"
                      />
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full border border-background shadow-sm" />
                    </div>

                    <div className="flex flex-col">
                      <h1 className="text-sm font-bold tracking-tight text-foreground/70 leading-none">
                        AI Study Buddy
                      </h1>
                      <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">
                        Assistant v2
                      </span>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-1.5">

                    {/* The Hero Source Button */}
                    <Button
                      variant="default" // Changed to default since you want solid Primary
                      size="sm"
                      onClick={() => setShowSourceDialog(true)}
                      className="h-8 px-3 gap-2 bg-primary text-primary-foreground border-t border-white/10 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-lg shadow-[0_2px_10px_-3px_rgba(var(--primary),0.4)]"
                    >
                      <LinkIcon className="w-3.5 h-3.5 opacity-90" />
                      <span className="text-[11px] font-bold tracking-tight">
                        {activeLabel ? activeLabel : 'Select Source'}
                      </span>
                    </Button>

                    {/* Minimalist Trash - Reduced opacity to keep focus on Primary button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearChat}
                      className="w-8 h-8 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 transition-all rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                </div>
              </div>
            </div>

            <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm">Context</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                  <SourceSelector
                    onSourceSelected={(content, id) => {
                      setActiveContent(content);
                      setActiveMaterialId(id);
                      setActiveLabel(id ? 'Indexed' : 'Uploaded');
                    }}
                  />
                  <Button variant="secondary" className="w-full mt-4 h-8 text-xs font-bold" onClick={() => setShowSourceDialog(false)}>
                    Confirm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card className="flex-1 flex flex-col border-none bg-transparent shadow-none rounded-none overflow-hidden relative">
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
                {isLoadingHistory ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/20" />
                  </div>
                ) : messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 border border-primary/10">
                      <Bot className="w-6 h-6 text-primary/40" />
                    </div>
                    <h2 className="text-[11px] font-black uppercase tracking-widest mb-1 opacity-60">Minimal focus mode.</h2>
                    <p className="text-muted-foreground max-w-xs mb-8 text-[10px] font-medium opacity-40">
                      Upload PDF or select library context.
                    </p>
                    <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                      {[
                        "Explain core concepts",
                        "Summarize key takeaways"
                      ].map((hint) => (
                        <Button
                          key={hint}
                          variant="ghost"
                          onClick={() => setInput(hint)}
                          className="justify-center h-8 px-4 text-[10px] font-bold border border-border/40 rounded-xl opacity-40 hover:opacity-100"
                        >
                          {hint}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((message, idx) => (
                      <motion.div
                        key={message.id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0 mt-1">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}

                        <div className={`flex flex-col gap-2 max-w-[85%] relative group`}>
                          {message.role === 'assistant' && <CopyButton content={message.content} />}
                          <div
                            className={`px-5 py-4 rounded-3xl shadow-sm text-base leading-relaxed ${message.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-[#111] border border-border/40 text-foreground rounded-tl-none shadow-xl'
                              }`}
                          >
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                          <span className={`text-[9px] uppercase font-black tracking-[0.2em] opacity-30 px-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {message.role === 'user' ? 'Student' : 'StudyBot'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="px-5 py-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-border/50 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-duration:0.8s] [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-duration:0.8s] [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-duration:0.8s]" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-10" />
              </div>

              {/* Enhanced Input Section */}
              <div className="p-4 md:p-8 bg-gradient-to-t from-background via-background to-transparent">
                {activeLabel && (
                  <div className="max-w-3xl mx-auto mb-3 flex justify-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-black text-blue-600 animate-in slide-in-from-bottom-2">
                      <FileText className="w-3.5 h-3.5" />
                      FOCUS MODE: {activeLabel}
                      <button onClick={() => { setActiveContent(''); setActiveLabel(null); setActiveMaterialId(undefined); }}>
                        <X className="w-3 h-3 hover:text-blue-800 transition-colors" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="relative group max-w-3xl mx-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[30px] blur opacity-15 group-focus-within:opacity-30 transition duration-500" />
                  <div className="relative flex items-center gap-2 bg-white dark:bg-[#111] border-2 border-border/50 rounded-[28px] p-2 transition-all duration-300 focus-within:border-blue-500/50">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={activeLabel ? "Ask a question about your document..." : "Type your message..."}
                      className="border-none bg-transparent focus-visible:ring-0 shadow-none px-6 text-lg h-14"
                    />
                    {isLoading ? (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-xl w-11 h-11 transition-all active:scale-95"
                        disabled
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                        className="rounded-xl w-11 h-11 transition-all active:scale-95"
                        size="icon"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
