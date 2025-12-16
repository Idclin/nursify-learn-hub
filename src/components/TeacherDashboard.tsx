import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { ContentCard } from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, FileText, Video, Music, Image, Calendar, Megaphone, 
  Plus, LogOut, Loader2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from '@/integrations/supabase/types';

type ContentType = Database['public']['Enums']['content_type'];
type TargetLevel = Database['public']['Enums']['target_level'];

const contentTypes: { id: ContentType; label: string; icon: React.ElementType }[] = [
  { id: 'pdf', label: 'PDF Notes', icon: FileText },
  { id: 'text', label: 'Text Notes', icon: FileText },
  { id: 'video', label: 'Video Lesson', icon: Video },
  { id: 'audio', label: 'Voice Note', icon: Music },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'study_plan', label: 'Study Plan', icon: Calendar },
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
];

export const TeacherDashboard: React.FC = () => {
  const { profile, logout } = useAuth();
  const { contents, addContent, uploadFile, deleteContent, isLoading: contentLoading } = useContent();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentType>('pdf');
  const [targetLevel, setTargetLevel] = useState<TargetLevel>('100');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsUploading(true);

    try {
      let fileUrl: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile, selectedType);
        if (uploadedUrl) {
          fileUrl = uploadedUrl;
        } else {
          setIsUploading(false);
          return;
        }
      }

      await addContent({
        title,
        description: description || undefined,
        type: selectedType,
        target_level: targetLevel,
        file_url: fileUrl,
        text_content: (selectedType === 'text' || selectedType === 'study_plan' || selectedType === 'announcement') 
          ? textContent 
          : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setTextContent('');
      setSelectedFile(null);
      setShowUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload content');
    }

    setIsUploading(false);
  };

  const myUploads = contents.filter(c => c.created_by === profile?.id).slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground sticky top-0 z-40 safe-top animate-fade-in">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between mb-1">
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="text-sm opacity-80">Teacher Dashboard</p>
              <h1 className="text-xl font-semibold">{profile?.full_name || 'Teacher'}</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout} 
              className="text-primary-foreground hover:bg-primary-foreground/10 transition-transform duration-200 hover:scale-110 animate-slide-up"
              style={{ animationDelay: '150ms' }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="px-4 -mt-4">
        <Card className="shadow-lg animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="animate-scale-in" style={{ animationDelay: '250ms' }}>
                <p className="text-2xl font-bold text-primary">{contents.length}</p>
                <p className="text-xs text-muted-foreground">Total Content</p>
              </div>
              <div className="animate-scale-in" style={{ animationDelay: '300ms' }}>
                <p className="text-2xl font-bold text-info">3</p>
                <p className="text-xs text-muted-foreground">Levels</p>
              </div>
              <div className="animate-scale-in" style={{ animationDelay: '350ms' }}>
                <p className="text-2xl font-bold text-success">{myUploads.length}</p>
                <p className="text-xs text-muted-foreground">My Uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Upload Section */}
      <section className="px-4 py-6">
        {!showUpload ? (
          <Button 
            variant="gradient" 
            className="w-full h-14 text-base animate-slide-up hover:scale-[1.02] transition-transform duration-300"
            style={{ animationDelay: '400ms' }}
            onClick={() => setShowUpload(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload New Content
          </Button>
        ) : (
          <Card className="animate-scale-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                Upload Content
                <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Type Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {contentTypes.slice(0, 4).map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                        selectedType === type.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{type.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {contentTypes.slice(4).map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                        selectedType === type.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{type.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Target Level</label>
                <Select value={targetLevel} onValueChange={(v) => setTargetLevel(v as TargetLevel)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Level 100 Only</SelectItem>
                    <SelectItem value="200">Level 200 Only</SelectItem>
                    <SelectItem value="300">Level 300 Only</SelectItem>
                    <SelectItem value="all">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="Enter content title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                <Textarea
                  placeholder="Brief description of the content"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Text Content for text-based types */}
              {(selectedType === 'text' || selectedType === 'study_plan' || selectedType === 'announcement') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    placeholder="Enter your content here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {/* File Upload for file-based types */}
              {(selectedType === 'pdf' || selectedType === 'video' || selectedType === 'audio' || selectedType === 'image') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Upload File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={
                      selectedType === 'pdf' ? '.pdf' :
                      selectedType === 'video' ? 'video/*' :
                      selectedType === 'audio' ? 'audio/*' :
                      'image/*'
                    }
                    onChange={handleFileSelect}
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedType === 'pdf' && 'PDF files up to 50MB'}
                          {selectedType === 'video' && 'MP4, MOV up to 500MB'}
                          {selectedType === 'audio' && 'MP3, WAV up to 100MB'}
                          {selectedType === 'image' && 'PNG, JPG up to 10MB'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <Button 
                variant="gradient" 
                className="w-full" 
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploading ? 'Uploading...' : 'Upload & Notify Students'}
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Uploads */}
      <section className="px-4">
        <h2 className="text-lg font-semibold mb-4 animate-slide-up" style={{ animationDelay: '450ms' }}>Recent Uploads</h2>
        {contentLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {myUploads.map((item, index) => (
              <ContentCard 
                key={item.id} 
                content={item} 
                showDelete 
                onDelete={() => deleteContent(item.id)}
                animationDelay={500 + index * 50}
              />
            ))}
          </div>
        )}
        {!contentLoading && myUploads.length === 0 && (
          <p className="text-center text-muted-foreground py-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
            No uploads yet. Start by uploading content above.
          </p>
        )}
      </section>
    </div>
  );
};
