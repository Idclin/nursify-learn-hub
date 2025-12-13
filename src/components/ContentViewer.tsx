import React from 'react';
import { Content } from '@/contexts/ContentContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LevelBadge } from '@/components/LevelBadge';
import { Button } from '@/components/ui/button';
import { FileText, Video, Music, Image, Calendar, Megaphone, Download, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContentViewerProps {
  content: Content | null;
  open: boolean;
  onClose: () => void;
}

const contentTypeConfig = {
  pdf: { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'PDF Document' },
  text: { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Text Note' },
  video: { icon: Video, color: 'text-purple-500', bgColor: 'bg-purple-500/10', label: 'Video Lesson' },
  audio: { icon: Music, color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Audio Lesson' },
  image: { icon: Image, color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Image' },
  study_plan: { icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10', label: 'Study Plan' },
  announcement: { icon: Megaphone, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Announcement' },
};

export const ContentViewer: React.FC<ContentViewerProps> = ({ content, open, onClose }) => {
  if (!content) return null;

  const config = contentTypeConfig[content.type];
  const Icon = config.icon;

  const renderMedia = () => {
    switch (content.type) {
      case 'video':
        return content.file_url ? (
          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <video 
              src={content.file_url} 
              controls 
              className="w-full h-full object-contain"
              poster={content.thumbnail_url || undefined}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Video not available</p>
        );

      case 'audio':
        return content.file_url ? (
          <div className="w-full bg-muted rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <div className={cn('p-6 rounded-full', config.bgColor)}>
                <Music className={cn('w-12 h-12', config.color)} />
              </div>
            </div>
            <audio src={content.file_url} controls className="w-full">
              Your browser does not support the audio tag.
            </audio>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Audio not available</p>
        );

      case 'pdf':
        return content.file_url ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className={cn('p-6 rounded-full', config.bgColor)}>
              <FileText className={cn('w-12 h-12', config.color)} />
            </div>
            <p className="text-muted-foreground text-center">PDF Document Ready</p>
            <div className="flex gap-2">
              <Button onClick={() => window.open(content.file_url!, '_blank')}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => window.open(content.file_url!, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Browser
              </Button>
            </div>
          </div>
        ) : null;

      case 'image':
        return content.file_url ? (
          <div className="w-full rounded-lg overflow-hidden">
            <img 
              src={content.file_url} 
              alt={content.title}
              className="w-full h-auto max-h-[60vh] object-contain"
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Image not available</p>
        );

      case 'text':
      case 'study_plan':
      case 'announcement':
        return content.text_content ? (
          <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 rounded-lg p-4">
            <p className="whitespace-pre-wrap">{content.text_content}</p>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('w-5 h-5', config.color)} />
            </div>
            <span className="text-sm text-muted-foreground">{config.label}</span>
            <LevelBadge level={content.target_level} />
          </div>
          <DialogTitle className="text-xl">{content.title}</DialogTitle>
          {content.description && (
            <DialogDescription className="text-base">
              {content.description}
            </DialogDescription>
          )}
          <p className="text-xs text-muted-foreground">
            Posted {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
          </p>
        </DialogHeader>

        <div className="mt-4">
          {renderMedia()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
