'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  materialId: string;
  materialTitle: string;
  cardCount: number;
  createdAt: Date;
  cards?: Flashcard[];
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);

  const handleDelete = (id: string) => {
    setDecks(decks.filter((d) => d.id !== id));
    toast.success('Flashcard deck deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Flashcards</h1>

            {decks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <span className="text-2xl">🎴</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No Flashcard Decks Yet</h2>
                  <p className="text-muted-foreground mb-6">Generate flashcard decks from your study materials to practice with spaced repetition</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    Create Flashcard Deck
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                  <Card key={deck.id} className="card-hover flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{deck.materialTitle}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {deck.cardCount} cards
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(deck.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Study
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(deck.id)}
                          className="text-destructive hover:text-destructive"
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
