'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Brain, Loader2, Sparkles, ChevronLeft, ChevronRight, RotateCcw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { SourceSelector } from '@/components/dashboard/source-selector';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  nextReview?: string | null;
}

interface Deck {
  id: string;
  title: string;
  cardCount: number;
  lastStudied?: string;
  materialId?: string;
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeContent, setActiveContent] = useState('');
  const [activeMaterialId, setActiveMaterialId] = useState<string | undefined>();
  const [activeFileUrl, setActiveFileUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Study Mode State
  const [studyDeck, setStudyDeck] = useState<Flashcard[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyDeckId, setStudyDeckId] = useState<string | null>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await fetch('/api/user/flashcards');
      const data = await res.json();
      // Group cards by materialId to represent "Decks"
      const grouped = (data.flashcards || []).reduce((acc: any, card: any) => {
        const mid = card.materialId || 'default';
        if (!acc[mid]) {
          acc[mid] = { 
            id: mid, 
            title: card.materialTitle || 'Untitled Deck', 
            cardCount: 0,
            materialId: card.materialId
          };
        }
        acc[mid].cardCount++;
        return acc;
      }, {});
      setDecks(Object.values(grouped));
    } catch (e) {
      toast.error('Failed to load decks');
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreateFlashcards = async () => {
    if (!activeContent.trim()) {
      toast.error('Please provide a source for the flashcards.');
      return;
    }
    
    setIsLoading(true);
    try {
      let materialId = activeMaterialId;

      // 1. If manual text or new PDF, index as material
      if (!materialId) {
        const matRes = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Deck Source: ${activeContent.slice(0, 30)}...`,
            content: activeContent,
            fileUrl: activeFileUrl,
          }),
        });
        const material = await matRes.json();
        materialId = material.id;
      }

      // 2. Generate and Auto-Save Flashcards via AI
      const genRes = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: activeContent, 
          materialId: materialId,
          cardCount: 10
        }),
      });
      const data = await genRes.json();
      
      if (data.flashcards) {
        toast.success('Flashcard deck indexed and ready!');
        fetchDecks();
        setShowCreateDialog(false);
        setActiveContent('');
        setActiveMaterialId(undefined);
      }
    } catch (e) {
      toast.error('Error generating deck');
    } finally {
      setIsLoading(false);
    }
  };

  const startStudy = async (deckId: string) => {
    try {
      const res = await fetch('/api/user/flashcards');
      const data = await res.json();
      const deckCards = data.flashcards.filter((c: any) => (c.materialId || 'default') === deckId);
      setStudyDeck(deckCards);
      setStudyDeckId(deckId);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (e) {
      toast.error('Error starting study session');
    }
  };

  const handleRateCard = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!studyDeck) return;
    const card = studyDeck[currentIndex];
    try {
      await fetch('/api/user/flashcards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, difficulty }),
      });
      
      if (currentIndex < studyDeck.length - 1) {
        setCurrentIndex(i => i + 1);
        setIsFlipped(false);
      } else {
        toast.success('Deck complete! Excellent progress.');
        setStudyDeck(null);
        fetchDecks();
      }
    } catch (e) {
      toast.error('Failed to update progress');
    }
  };

  const handleDeleteDeck = async (materialId: string) => {
    if (!window.confirm('Delete this entire deck?')) return;
    try {
      const res = await fetch(`/api/user/flashcards?materialId=${materialId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deck deleted');
        fetchDecks();
      }
    } catch {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Smart Flashcards</h1>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Deck
              </Button>
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>AI Flashcard Generator</DialogTitle>
                  <DialogDescription>Index a document or paste notes to generate active-recall flashcards.</DialogDescription>
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
                      onClick={handleCreateFlashcards}
                      disabled={isLoading || !activeContent}
                      className="w-full font-semibold h-10"
                    >
                      {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Building Deck...</> : 'Generate Smart Deck'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Study Modal */}
            <Dialog open={!!studyDeck} onOpenChange={open => !open && setStudyDeck(null)}>
              <DialogContent className="max-w-2xl min-h-[400px] flex flex-col items-center justify-center bg-card/50 backdrop-blur-2xl">
                <DialogHeader className="w-full text-center mb-4">
                  <DialogTitle>Study Session</DialogTitle>
                  <DialogDescription>Reviewing your active recall deck.</DialogDescription>
                </DialogHeader>
                
                {studyDeck && studyDeck.length > 0 && (
                  <div className="w-full flex-1 flex flex-col items-center">
                    <div className="relative w-full max-w-lg aspect-[4/3] perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentIndex + (isFlipped ? '-back' : '-front')}
                          initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full rounded-2xl p-8 flex items-center justify-center text-center text-2xl font-bold shadow-2xl border-2 border-primary/20 bg-background/80"
                        >
                          {isFlipped ? studyDeck[currentIndex].back : studyDeck[currentIndex].front}
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute bottom-4 right-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {isFlipped ? 'Answer' : 'Question'} - Click to flip
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-center mt-8 px-4">
                      <div className="text-sm font-bold text-muted-foreground uppercase">Card {currentIndex + 1} / {studyDeck.length}</div>
                      {isFlipped ? (
                        <div className="flex gap-2">
                          <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold h-10" onClick={() => handleRateCard('hard')}>Hard</Button>
                          <Button variant="outline" className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 font-bold h-10" onClick={() => handleRateCard('medium')}>Good</Button>
                          <Button variant="outline" className="border-green-500/20 text-green-500 hover:bg-green-500/10 font-bold h-10" onClick={() => handleRateCard('easy')}>Easy</Button>
                        </div>
                      ) : (
                        <Button variant="secondary" className="font-bold px-8 shadow-sm h-10" onClick={() => setIsFlipped(true)}>Reveal Answer</Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {isFetching ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : decks.length === 0 ? (
              <Card className="border-dashed bg-muted/5 border-2 mt-8">
                <CardContent className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-10 border border-primary/20">
                    <Brain className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-4xl font-black mb-4">No Brainer.</h2>
                  <p className="text-muted-foreground mb-10 max-w-sm">Upload your study material to auto-generate adaptive flashcards. Spaced repetition starts here.</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Sparkles className="w-4 h-4 mr-2" /> Create Your First Deck
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-8">
                {decks.map((deck) => (
                  <Card key={deck.id} className="group border-none shadow-2xl overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl ring-1 ring-white/10 hover:ring-primary/40 transition-all duration-500 rounded-3xl">
                    <CardHeader className="pb-4 flex-row items-start justify-between">
                      <div className="space-y-3 pr-4">
                        <CardTitle className="text-2xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-1">{deck.title}</CardTitle>
                        <div className="flex items-center gap-4 text-xs font-black text-muted-foreground/60 uppercase tracking-widest">
                          <span className="bg-primary/5 text-primary px-3 py-1 rounded-full">{deck.cardCount} Cards</span>
                          {deck.lastStudied && <span>Last {new Date(deck.lastStudied).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDeck(deck.id)} className="text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5 -mt-2 -mr-2">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                       <Button 
                         className="w-full font-semibold h-10" 
                         onClick={() => startStudy(deck.id)}
                       >
                         Study Deck
                       </Button>
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
