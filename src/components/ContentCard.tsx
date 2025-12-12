import { Content } from '@/contexts/ContentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LevelBadge } from '@/components/LevelBadge';
import { FileText, Video, Music, Image, Calendar, Megaphone, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ContentCardProps {
  content: Content;
  onView?: () => void;
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

export const ContentCard: React.FC<ContentCardProps> = ({ content, onView }) => {
  const config = contentTypeConfig[content.type];
  const Icon = config.icon;

  return (
    <Card className="group cursor-pointer overflow-hidden" onClick={onView}>
      {content.type === 'video' && content.thumbnail_url && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
              <div className={cn('p-2.5 rounded-xl', config.bgColor)}>
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
              className="flex-1" 
              onClick={(e) => {
                e.stopPropagation();
                window.open(content.file_url!, '_blank');
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}
          <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
