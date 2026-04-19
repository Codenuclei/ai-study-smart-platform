'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Trash2, Loader2, Eye, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { SourceSelector } from '@/components/dashboard/source-selector';

interface Summary {
  id: string;
  materialId: string;
  materialTitle: string;
  content: string;
  createdAt: string;
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeContent, setActiveContent] = useState('');
  const [activeMaterialId, setActiveMaterialId] = useState<string | undefined>();
  const [activeFileUrl, setActiveFileUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [viewSummary, setViewSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const res = await fetch('/api/user/summaries');
      const data = await res.json();
      setSummaries(data.summaries || []);
    } catch (e) {
      toast.error('Failed to load summaries');
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreateSummary = async () => {
    if (!activeContent.trim()) {
      toast.error('Please provide a source for summarization');
      return;
    }

    setIsLoading(true);
    try {
      let materialId = activeMaterialId;

      // 1. If it's manual text or a new PDF upload, index it as a material first
      if (!materialId) {
        const matRes = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Summary Source: ${activeContent.slice(0, 30)}...`,
            content: activeContent,
            fileUrl: activeFileUrl,
          }),
        });
        const material = await matRes.json();
        materialId = material.id;
      }

      // 2. Generate and Auto-Save Summary via AI
      const genRes = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: activeContent,
          materialId: materialId,
          style: 'comprehensive'
        }),
      });
      const data = await genRes.json();

      if (data.summary) {
        toast.success('Summary generated and saved to library!');
        fetchSummaries();
        setShowCreateDialog(false);
        setActiveContent('');
        setActiveMaterialId(undefined);
      }
    } catch (e) {
      toast.error('Error generating summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this summary?')) return;
    try {
      const res = await fetch('/api/user/summaries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSummaries(summaries.filter(s => s.id !== id));
        toast.success('Summary deleted');
      }
    } catch {
      toast.error('Deletion failed');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">AI Summaries</h1>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Summary
              </Button>
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>AI Summarizer</DialogTitle>
                  <DialogDescription>Paste text, upload a PDF, or pick an existing material to condense it with AI.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <SourceSelector
                    onSourceSelected={(content, id, url) => {
                      setActiveContent(content);
                      setActiveMaterialId(id);
                      setActiveFileUrl(url);
                    }}
                    isLoading={isLoading}
                  />

                  <div className="mt-8">
                    <Button
                      onClick={handleCreateSummary}
                      disabled={isLoading || !activeContent}
                      className="w-full font-semibold"
                    >
                      {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Condensing...</> : 'Summarize Now'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* View Summary Dialog */}
            <Dialog open={!!viewSummary} onOpenChange={open => !open && setViewSummary(null)}>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">{viewSummary?.materialTitle}</DialogTitle>
                  <DialogDescription>Extracted study summary.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto prose prose-sm dark:prose-invert max-w-none py-6 border-y scrollbar-hide">
                  <ReactMarkdown>{viewSummary?.content || ''}</ReactMarkdown>
                </div>
                <div className="flex justify-end gap-3 pt-6">
                  <Button variant="outline" className="h-10 font-bold" onClick={() => copyToClipboard(viewSummary?.content || '')}>
                    <Copy className="w-4 h-4 mr-2" /> Copy Markdown
                  </Button>
                  <Button className="h-10 font-bold px-8" onClick={() => setViewSummary(null)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>

            {isFetching ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : summaries.length === 0 ? (
              <Card className="border-dashed bg-muted/5 border-2">
                <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-8 border border-primary/20">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 text-foreground">No Summaries Yet</h2>
                  <p className="text-muted-foreground mb-10 max-w-md">Turn long documents into condensed study guides. Upload your first file or paste text to begin.</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Sparkles className="w-4 h-4 mr-2" /> Get Started
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {summaries.map((s) => (
                  <Card key={s.id} className="group border-none shadow-xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl ring-1 ring-white/20 hover:ring-primary/50 transition-all duration-300">
                    <CardHeader className="pb-4 flex-row items-start justify-between">
                      <div className="space-y-2 pr-4">
                        <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{s.materialTitle}</CardTitle>
                        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest pt-1">Added {new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground line-clamp-4 mb-8 min-h-[5.5em] leading-relaxed opacity-80">
                        {s.content.replace(/[#*]/g, '')}
                      </div>
                      <div className="flex gap-3 w-full pt-6 border-t border-muted/20">
                        <Button className="flex-1 font-semibold" onClick={() => setViewSummary(s)}>
                          <Eye className="w-4 h-4 mr-2" /> Read
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(s.content)} className="h-10 w-10 border-muted-foreground/10 hover:bg-primary/10 hover:text-primary transition-colors">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(s.id)} className="h-10 w-10 border-muted-foreground/10 hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
