import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { BarChart3, TrendingUp, Clock, Zap } from 'lucide-react';

export const metadata = {
  title: 'Analytics - StudyAI',
  description: 'Track your learning progress and analytics',
};

export default function AnalyticsPage() {
  // Mock data - will be replaced with actual analytics
  const stats = [
    {
      title: 'Study Hours',
      value: '0',
      description: 'Total hours studied',
      icon: Clock,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Quiz Score',
      value: '0%',
      description: 'Average quiz performance',
      icon: Zap,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Materials Reviewed',
      value: 0,
      description: 'Completed materials',
      icon: BarChart3,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Learning Streak',
      value: 0,
      description: 'Consecutive study days',
      icon: TrendingUp,
      trend: { value: 0, isPositive: true },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Learning Analytics</h1>
              <p className="text-muted-foreground">
                Track your progress and performance across all your study materials
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Charts and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Study Time Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Study Time This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border border-border/40">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">No data yet. Start studying to see your analytics!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Study Consistency</span>
                      <span className="font-semibold">0%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Material Completion</span>
                      <span className="font-semibold">0%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quiz Mastery</span>
                      <span className="font-semibold">0%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Breakdown */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Add some study materials to see performance breakdown by subject</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
