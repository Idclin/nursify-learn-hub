import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { ContentCard } from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, FileText, Video, Music, Image, Calendar, Megaphone, 
  Plus, Users, Bell, Settings, LogOut, ChevronDown 
} from 'lucide-react';
import { ContentType, TargetLevel } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { user, logout } = useAuth();
  const { contents, addContent } = useContent();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentType>('pdf');
  const [targetLevel, setTargetLevel] = useState<TargetLevel>(100);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');

  const handleUpload = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    addContent({
      title,
      description,
      type: selectedType,
      targetLevel,
      createdBy: user?.id || '',
      textContent: selectedType === 'text' || selectedType === 'study_plan' || selectedType === 'announcement' 
        ? textContent 
        : undefined,
    });

    toast.success(`Content uploaded successfully! Notification sent to ${targetLevel === 'all' ? 'all levels' : `Level ${targetLevel}`}`);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTextContent('');
    setShowUpload(false);
  };

  const recentUploads = contents.filter(c => c.createdBy === user?.id).slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground sticky top-0 z-40 safe-top">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm opacity-80">Teacher Dashboard</p>
              <h1 className="text-xl font-semibold">{user?.fullName}</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="px-4 -mt-4">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{contents.length}</p>
                <p className="text-xs text-muted-foreground">Total Uploads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-info">156</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">3</p>
                <p className="text-xs text-muted-foreground">Levels</p>
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
            className="w-full h-14 text-base"
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
                  Cancel
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
                <Select value={String(targetLevel)} onValueChange={(v) => setTargetLevel(v === 'all' ? 'all' : Number(v) as 100 | 200 | 300)}>
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
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
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
                  </div>
                </div>
              )}

              <Button variant="gradient" className="w-full" onClick={handleUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload & Notify Students
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Uploads */}
      <section className="px-4">
        <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
        <div className="space-y-3">
          {recentUploads.map(item => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
        {recentUploads.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No uploads yet. Start by uploading content above.
          </p>
        )}
      </section>
    </div>
  );
};
