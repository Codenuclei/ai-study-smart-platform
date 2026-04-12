'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Summary {
  id: string;
  materialId: string;
  materialTitle: string;
  content: string;
  createdAt: Date;
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const handleDelete = (id: string) => {
    setSummaries(summaries.filter((s) => s.id !== id));
    toast.success('Summary deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">AI Summaries</h1>

            {summaries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No Summaries Yet</h2>
                  <p className="text-muted-foreground mb-6">Generate summaries from your study materials to see them here</p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    Generate Summary
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {summaries.map((summary) => (
                  <Card key={summary.id} className="card-hover">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle>{summary.materialTitle}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          Created {new Date(summary.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(summary.content)}
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(summary.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground line-clamp-3">{summary.content}</p>
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
