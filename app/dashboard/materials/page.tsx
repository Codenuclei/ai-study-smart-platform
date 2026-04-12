'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2, Eye, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface Material {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  summary?: string;
  summaryCount: number;
  quizCount: number;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAddMaterial = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter both title and content');
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Save to database via API
      const newMaterial: Material = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date(),
        summaryCount: 0,
        quizCount: 0,
      };

      setMaterials([newMaterial, ...materials]);
      setTitle('');
      setContent('');
      toast.success('Material added successfully!');
    } catch (error) {
      toast.error('Failed to add material');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
    toast.success('Material deleted');
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
            <h1 className="text-3xl font-bold mb-8">Study Materials</h1>

            {/* Upload Section */}
            <Card className="mb-8 gradient-border">
              <CardHeader>
                <CardTitle>Add New Material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g., Chapter 5: Photosynthesis"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="text-sm font-medium">
                    Content
                  </label>
                  <textarea
                    id="content"
                    placeholder="Paste your notes here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 mt-2 p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button
                  onClick={handleAddMaterial}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Adding...' : 'Add Material'}
                </Button>
              </CardContent>
            </Card>

            {/* Materials List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Your Materials</CardTitle>
                <Input
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
              </CardHeader>
              <CardContent>
                {filteredMaterials.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No materials yet. Add one to get started!</p>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload First Material
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-start justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/30 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <h3 className="font-semibold">{material.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {material.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                            <span>📚 {material.summaryCount} summaries</span>
                            <span>❓ {material.quizCount} quizzes</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="Generate AI Content">
                            <Wand2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="View Material">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(material.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
