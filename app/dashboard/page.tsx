import { requireAuth } from '@/lib/auth-utils';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Zap, Brain, Trophy, Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard - StudyAI',
  description: 'Your AI-powered study dashboard',
};

export default async function DashboardPage() {
  const session = await requireAuth();

  // Mock data - will be replaced with actual data from database
  const stats = [
    {
      title: 'Study Materials',
      value: 0,
      description: 'Total materials uploaded',
      icon: BookOpen,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'AI Summaries',
      value: 0,
      description: 'Generated summaries',
      icon: Zap,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Quizzes Created',
      value: 0,
      description: 'Total quizzes',
      icon: Brain,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Learning Streak',
      value: 0,
      description: 'Days in a row',
      icon: Trophy,
      trend: { value: 0, isPositive: true },
    },
  ];

  const recentActivities: any[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Welcome back, {session.user?.name}! 👋
              </h1>
              <p className="text-muted-foreground">Start learning smarter with AI-powered summaries and quizzes</p>
            </div>

            {/* Quick Action Button */}
            <div className="mb-8">
              <Link href="/dashboard/materials">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Study Material
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Getting Started */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/40">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-600">1</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Upload Your Notes</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Upload PDFs, text documents, or paste your study notes directly.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/40">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-purple-600">2</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">AI Generates Content</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Our AI creates summaries, quizzes, and flashcards from your materials.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/40">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-pink-600">3</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Learn & Practice</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Study with interactive quizzes and get guidance from our AI chatbot.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div>
                <ActivityFeed activities={recentActivities} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
