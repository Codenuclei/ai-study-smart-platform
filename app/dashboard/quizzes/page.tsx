'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Trash2, Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SourceSelector } from '@/components/dashboard/source-selector';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  materialId: string;
  materialTitle: string;
  title: string;
  difficulty: string;
  questionCount: number;
  createdAt: string;
  bestScore?: number;
  questions?: QuizQuestion[];
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeContent, setActiveContent] = useState('');
  const [activeMaterialId, setActiveMaterialId] = useState<string | undefined>();
  const [activeFileUrl, setActiveFileUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Active Quiz State
  const [quizModal, setQuizModal] = useState<Quiz | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/user/quizzes');
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (e) {
      toast.error('Failed to load quizzes');
    } finally {
      setIsFetching(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      const res = await fetch('/api/user/quizzes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setQuizzes(quizzes.filter((q) => q.id !== id));
        toast.success('Quiz deleted');
      }
    } catch {
      toast.error('Deletion failed');
    }
  };

  const handleCreateQuiz = async () => {
    if (!activeContent.trim()) {
      toast.error('Please provide or select content first.');
      return;
    }
    
    setIsLoading(true);
    try {
      let materialId = activeMaterialId;

      // 1. If it's manual text or a new PDF upload without a saved material, create one
      if (!materialId) {
        const matRes = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Quiz Source: ${activeContent.slice(0, 30)}...`,
            content: activeContent,
            fileUrl: activeFileUrl,
          }),
        });
        const material = await matRes.json();
        materialId = material.id;
      }

      if (!materialId) throw new Error('Could not resolve material ID');

      // 2. Generate Quiz via AI
      const genRes = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: activeContent, questionCount: 5 }),
      });
      const data = await genRes.json();

      if (data.questions) {
        // 3. Save Quiz to DB
        const saveRes = await fetch('/api/user/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materialId,
            title: data.title || 'Untitled Quiz',
            questions: data.questions,
          }),
        });
        
        if (saveRes.ok) {
          toast.success('Quiz generated and indexed!');
          fetchQuizzes();
          setShowCreateDialog(false);
          setActiveContent('');
          setActiveMaterialId(undefined);
        }
      }
    } catch (e) {
      toast.error('Error generating quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === quizModal?.questions?.[quizIndex]?.correctAnswer) {
      setCorrectCount(c => c + 1);
    }
  };

  const handleNext = async () => {
    if (!quizModal) return;
    if (quizIndex < quizModal.questions!.length - 1) {
      setQuizIndex(i => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      const score = (correctCount / quizModal.questions!.length) * 100;
      setIsFinished(true);
      await fetch('/api/user/quizzes/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quizModal.id,
          score,
          totalQuestions: quizModal.questions!.length,
        }),
      });
      fetchQuizzes();
    }
  };

  const currentQuestion = quizModal?.questions?.[quizIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Quizzes</h1>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Study Quiz
              </Button>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>AI Quiz Generator</DialogTitle>
                  <DialogDescription>
                    Provide a source to generate an interactive quiz. You can paste text, upload a PDF, or pick from your library.
                  </DialogDescription>
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
                  
                  <div className="mt-6">
                    <Button
                      onClick={handleCreateQuiz}
                      disabled={isLoading || !activeContent}
                      className="w-full font-semibold"
                    >
                      {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cooking Quiz...</> : 'Generate Quiz Now'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={!!quizModal} onOpenChange={open => {
              if (!open) {
                setQuizModal(null);
                setQuizIndex(0);
                setSelectedOption(null);
                setShowExplanation(false);
                setIsFinished(false);
                setCorrectCount(0);
              }
            }}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{isFinished ? 'Study Session Complete' : `Question ${quizIndex + 1}`}</DialogTitle>
                  <DialogDescription>
                    {isFinished ? 'Review your results below.' : 'Select the correct answer based on the provided material.'}
                  </DialogDescription>
                </DialogHeader>
                
                {quizModal && (
                  <div className="py-2">
                    {isFinished ? (
                      <div className="text-center space-y-6 py-8">
                        <div className="relative inline-block">
                          <div className="text-7xl font-black text-primary">
                            {Math.round((correctCount / quizModal.questions!.length) * 100)}%
                          </div>
                          <div className="text-xs font-bold uppercase tracking-widest mt-2 text-muted-foreground">Accuracy Score</div>
                        </div>
                        <p>Excellent work! You got {correctCount} / {quizModal.questions!.length} correct.</p>
                        <Button className="w-full" onClick={() => setQuizModal(null)}>Dismiss</Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-xl font-medium leading-relaxed">{currentQuestion?.question}</div>
                        <div className="grid gap-3">
                          {currentQuestion?.options.map((opt, idx) => {
                            const isCorrect = idx === currentQuestion.correctAnswer;
                            const isSelected = selectedOption === idx;
                            let variant: "outline" | "default" | "destructive" = "outline";
                            if (isSelected) variant = isCorrect ? "default" : "destructive";
                            else if (selectedOption !== null && isCorrect) variant = "default";

                            return (
                              <Button
                                key={idx}
                                variant={variant}
                                className={`justify-start h-auto py-4 px-6 text-left whitespace-normal border-2 ${isSelected && isCorrect ? 'border-primary' : ''}`}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={selectedOption !== null}
                              >
                                {opt}
                              </Button>
                            );
                          })}
                        </div>
                        
                        {showExplanation && (
                          <div className="p-4 rounded-2xl bg-muted/60 text-sm animate-in fade-in slide-in-from-top-2 border">
                            <span className="font-bold block mb-1 uppercase text-xs tracking-wider opacity-60">Learn more</span>
                            {currentQuestion?.explanation}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-6 border-t">
                          <span className="text-sm font-bold text-muted-foreground uppercase">{quizIndex + 1} / {quizModal.questions?.length}</span>
                          <Button onClick={handleNext} disabled={selectedOption === null}>
                            {quizIndex === (quizModal.questions?.length || 1) - 1 ? 'See Results' : 'Next Question'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {isFetching ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : quizzes.length === 0 ? (
              <Card className="border-dashed bg-muted/5 border-2">
                <CardContent className="flex flex-col items-center justify-center py-24">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-8 border border-primary/20">
                    <span className="text-4xl">📚</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">Your Library is Empty</h2>
                  <p className="text-muted-foreground mb-10 max-w-sm text-center">Upload your study material or paste text to generate your first AI-smart quiz.</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Sparkles className="w-4 h-4 mr-2" /> Get Started
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="group border-none shadow-md overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl ring-1 ring-white/20 hover:ring-primary/50 transition-all duration-300 rounded-2xl">
                    <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
                      <div className="space-y-1 pr-4">
                        <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">{quiz.materialTitle}</CardTitle>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          <span>{quiz.questionCount} Qs</span>
                          <span>•</span>
                          <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {quiz.bestScore !== undefined && (
                          <div className={`text-lg font-black ${Number(quiz.bestScore) >= 80 ? 'text-green-500' : 'text-primary'}`}>
                            {Math.round(Number(quiz.bestScore))}%
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2 pb-4">
                       <div className="flex gap-2 w-full">
                          <Button 
                            variant="secondary"
                            className="flex-1 font-semibold h-9 text-xs" 
                            onClick={async () => {
                              try {
                                const qRes = await fetch(`/api/user/quizzes/${quiz.id}`);
                                const qData = await qRes.json();
                                setQuizModal({...quiz, questions: qData.questions});
                                setQuizIndex(0);
                                setSelectedOption(null);
                                setCorrectCount(0);
                                setIsFinished(false);
                              } catch (e) {
                                toast.error("Selection failed.");
                              }
                            }}
                          >
                            <PlayCircle className="w-3.5 h-3.5 mr-1.5" /> Play
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(quiz.id)} className="h-9 w-9 border-muted-foreground/10 hover:bg-destructive/10 hover:text-destructive text-muted-foreground/40 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
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
