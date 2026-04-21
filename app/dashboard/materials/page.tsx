'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Trash2, Eye, Sparkles, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SourceSelector } from '@/components/dashboard/source-selector';
import ReactMarkdown from 'react-markdown';

interface Material {
  id: string;
  title: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeContent, setActiveContent] = useState('');
  const [activeTitle, setActiveTitle] = useState('');
  const [activeFileUrl, setActiveFileUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMaterial, setViewMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error('Failed to load library');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!activeContent.trim()) {
      toast.error('No content to save');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeTitle || `Document: ${activeContent.slice(0, 30)}...`,
          content: activeContent,
          fileUrl: activeFileUrl,
        }),
      });

      if (res.ok) {
        toast.success('Material added to library');
        fetchMaterials();
        setShowAddDialog(false);
        setActiveContent('');
        setActiveTitle('');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to add material');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this material? Associated quizzes and cards will be deleted.')) return;
    try {
      const res = await fetch('/api/materials', {
        method: 'DELETE', // Assuming DELETE is implemented similarly
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMaterials(materials.filter((m) => m.id !== id));
        toast.success('Material removed');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Study Library</h1>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Index New Document
              </Button>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add to Library</DialogTitle>
                  <DialogDescription>
                    Provide text or upload a PDF to index it for generation across the platform.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70">Library Title (Optional)</label>
                    <Input
                      placeholder="e.g. Biology Chapter 4"
                      value={activeTitle}
                      onChange={(e) => setActiveTitle(e.target.value)}
                    />
                  </div>
                  <SourceSelector
                    onSourceSelected={(content, id, url) => {
                      setActiveContent(content);
                      setActiveFileUrl(url);
                    }}
                    isLoading={isLoading}
                  />
                  <Button
                    onClick={handleAddMaterial}
                    disabled={isLoading || !activeContent}
                    className="w-full font-semibold"
                  >
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Indexing...</> : 'Save to Library'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={!!viewMaterial} onOpenChange={open => !open && setViewMaterial(null)}>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">{viewMaterial?.title}</DialogTitle>
                  <DialogDescription>Original indexed content.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto py-6 prose prose-sm dark:prose-invert max-w-none border-y scrollbar-hide">
                  <ReactMarkdown>{viewMaterial?.content || ''}</ReactMarkdown>
                </div>
                <div className="flex justify-end pt-6">
                  <Button className="font-bold px-8 h-10" onClick={() => setViewMaterial(null)}>Close Library View</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Search */}
            <div className="mb-8 max-w-md">
              <Input
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 bg-white/50 backdrop-blur-sm border-2"
              />
            </div>

            {isFetching ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : filteredMaterials.length === 0 ? (
              <Card className="border-dashed bg-muted/5 border-2">
                <CardContent className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-8 border border-primary/20">
                    <FileText className="w-10 h-10 text-primary opacity-40" />
                  </div>
                  <p className="text-muted-foreground mb-10 max-w-xs">Your library is currently empty. Index documents to use them across the dashboard.</p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add First Document
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMaterials.map((material) => (
                  <Card
                    key={material.id}
                    className="group border-none shadow-xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl ring-1 ring-white/20 hover:ring-primary/50 transition-all duration-500"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{material.title}</CardTitle>
                        <FileText className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors shrink-0 ml-2" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mt-2">Indexed {new Date(material.createdAt).toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed mb-8 h-12">
                        {material.content}
                      </p>
                      <div className="flex gap-2 pt-6 border-t border-muted/20">
                        <Button variant="outline" className="flex-1 h-10 font-bold border-muted-foreground/10 hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setViewMaterial(material)}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        {material.fileUrl && (
                          <Button variant="outline" className="h-10 font-bold border-muted-foreground/10" asChild>
                            <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-2" /> PDF
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(material.id)}
                          className="h-10 w-10 border-muted-foreground/10 hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground/20"
                        >
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
