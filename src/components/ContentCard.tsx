import { useState } from 'react';
import { Content } from '@/contexts/ContentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LevelBadge } from '@/components/LevelBadge';
import { FileText, Video, Music, Image, Calendar, Megaphone, Download, Heart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ContentCardProps {
  content: Content;
  onView?: () => void;
  onDelete?: () => Promise<void>;
  showDelete?: boolean;
  animationDelay?: number;
}

const contentTypeConfig = {
  pdf: { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  text: { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  video: { icon: Video, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  audio: { icon: Music, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  image: { icon: Image, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  study_plan: { icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
  announcement: { icon: Megaphone, color: 'text-warning', bgColor: 'bg-warning/10' },
};

export const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onView, 
  onDelete, 
  showDelete,
  animationDelay = 0 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const config = contentTypeConfig[content.type];
  const Icon = config.icon;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
      }
    }
  };

  return (
    <>
      <Card 
        className="group cursor-pointer overflow-hidden animate-slide-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
        onClick={onView}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {content.type === 'video' && content.thumbnail_url && (
          <div className="relative h-36 overflow-hidden">
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <div className={cn('p-2 rounded-full', config.bgColor)}>
                <Icon className={cn('w-5 h-5', config.color)} />
              </div>
            </div>
          </div>
        )}
        
        {content.type === 'image' && content.file_url && (
          <div className="relative h-36 overflow-hidden">
            <img
              src={content.file_url}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}

        <CardHeader className={cn(
          'pb-2',
          (content.type === 'video' || content.type === 'image') && (content.thumbnail_url || content.file_url) ? 'pt-3' : ''
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {content.type !== 'video' && content.type !== 'image' && (
                <div className={cn('p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110', config.bgColor)}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
                  {content.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <LevelBadge level={content.target_level} />
          </div>
        </CardHeader>

        <CardContent>
          {content.description && (
            <CardDescription className="line-clamp-2 mb-3">
              {content.description}
            </CardDescription>
          )}
          
          <div className="flex items-center gap-2">
            {content.type === 'pdf' && content.file_url && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 transition-all duration-200 hover:scale-[1.02]" 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(content.file_url!, '_blank');
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
            {showDelete && onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110" 
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 transition-all duration-200 hover:scale-110 hover:text-red-500" 
              onClick={(e) => e.stopPropagation()}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !isDeleting && setShowDeleteDialog(open)}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{content.title}"? This action cannot be undone and will remove the content for all students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
