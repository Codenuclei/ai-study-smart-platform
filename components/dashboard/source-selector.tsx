'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Material {
  id: string;
  title: string;
  content: string;
  fileUrl?: string;
}

interface SourceSelectorProps {
  onSourceSelected: (content: string, materialId?: string, fileUrl?: string) => void;
  isLoading?: boolean;
}

export function SourceSelector({ onSourceSelected, isLoading }: SourceSelectorProps) {
  const [sourceType, setSourceType] = useState<'text' | 'file' | 'existing'>('text');
  const [manualText, setManualText] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  useEffect(() => {
    if (sourceType === 'existing') {
      fetchMaterials();
    }
  }, [sourceType]);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      setMaterials(data || []);
    } catch {
      toast.error('Failed to load existing materials');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setActiveLabel(file.name);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/materials/extract', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        toast.success(`Extracted content from ${file.name}`);
        onSourceSelected(data.text, undefined, data.fileUrl);
      } else {
        throw new Error(data.error || 'Extraction failed');
      }
    } catch (err) {
      toast.error('Could not process PDF');
      setActiveLabel(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleExistingSelect = (id: string) => {
    const mat = materials.find(m => m.id === id);
    if (mat) {
      setSelectedMaterialId(id);
      setActiveLabel(mat.title);
      onSourceSelected(mat.content, id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={sourceType === 'text' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setSourceType('text')}
          className="rounded-full"
        >
          <FileText className="w-4 h-4 mr-2" /> Manual Text
        </Button>
        <Button 
          variant={sourceType === 'file' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setSourceType('file')}
          className="rounded-full"
        >
          <Upload className="w-4 h-4 mr-2" /> Upload PDF
        </Button>
        <Button 
          variant={sourceType === 'existing' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setSourceType('existing')}
          className="rounded-full"
        >
          <LinkIcon className="w-4 h-4 mr-2" /> Existing Material
        </Button>
      </div>

      <div className="min-h-[160px] p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5">
        {sourceType === 'text' && (
          <div className="space-y-4">
            <Label>Enter content for generation</Label>
            <textarea
              className="w-full h-32 p-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
              placeholder="Paste your study notes, article, or chapter text here..."
              value={manualText}
              onChange={(e) => {
                setManualText(e.target.value);
                onSourceSelected(e.target.value);
              }}
            />
          </div>
        )}

        {sourceType === 'file' && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            {isProcessingFile ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Extracting text from PDF...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <Label htmlFor="pdf-upload" className="cursor-pointer text-primary hover:underline font-bold">
                    Click to upload PDF
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">Maximum 10MB per file</p>
                </div>
                <Input 
                  id="pdf-upload" 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </>
            )}
            {activeLabel && sourceType === 'file' && !isProcessingFile && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-bold text-primary animate-in zoom-in-95">
                <FileText className="w-3 h-3" /> {activeLabel}
              </div>
            )}
          </div>
        )}

        {sourceType === 'existing' && (
          <div className="space-y-4">
            <Label>Select from your library</Label>
            {materials.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No materials found in your library.</p>
            ) : (
              <div className="space-y-3">
                <Select value={selectedMaterialId} onValueChange={handleExistingSelect}>
                  <SelectTrigger className="w-full bg-background border-2">
                    <SelectValue placeholder="Pick a study material..." />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((mat) => (
                      <SelectItem key={mat.id} value={mat.id}>
                        {mat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeLabel && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-bold text-primary w-fit animate-in zoom-in-95">
                    <FileText className="w-3 h-3" /> Selected: {activeLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
