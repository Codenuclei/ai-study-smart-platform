'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Trash2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface Quiz {
  id: string;
  materialId: string;
  materialTitle: string;
  questionCount: number;
  createdAt: Date;
  bestScore?: number;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const handleDelete = (id: string) => {
    setQuizzes(quizzes.filter((q) => q.id !== id));
    toast.success('Quiz deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Quizzes</h1>

            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <span className="text-2xl">❓</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No Quizzes Yet</h2>
                  <p className="text-muted-foreground mb-6">Generate quizzes from your study materials to practice and test your knowledge</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    Create Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="card-hover">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle>{quiz.materialTitle}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          {quiz.questionCount} questions • Created {new Date(quiz.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {quiz.bestScore && (
                          <div className="text-right pr-4">
                            <p className="text-sm text-muted-foreground">Best Score</p>
                            <p className="text-2xl font-bold text-primary">{quiz.bestScore}%</p>
                          </div>
                        )}
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                        <Button variant="ghost" size="sm" title="Stats">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quiz.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
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
