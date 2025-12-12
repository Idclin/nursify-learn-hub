import { useContent } from '@/contexts/ContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { ContentCard } from '@/components/ContentCard';
import { ContentType } from '@/types';
import { FileText, Video, Music, Megaphone, Calendar, Image } from 'lucide-react';

interface ContentListProps {
  type: ContentType | ContentType[];
  title: string;
}

const typeIcons: Record<ContentType, React.ElementType> = {
  pdf: FileText,
  text: FileText,
  video: Video,
  audio: Music,
  image: Image,
  study_plan: Calendar,
  announcement: Megaphone,
};

export const ContentList: React.FC<ContentListProps> = ({ type, title }) => {
  const { user } = useAuth();
  const { getContentByType, getContentByLevel } = useContent();
  
  const userLevel = user?.level || 100;
  const types = Array.isArray(type) ? type : [type];
  
  const content = getContentByLevel(userLevel).filter(c => types.includes(c.type));

  const Icon = typeIcons[types[0]];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero sticky top-0 z-40 safe-top px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{content.length} items available</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {content.map(item => (
          <ContentCard key={item.id} content={item} />
        ))}

        {content.length === 0 && (
          <div className="text-center py-16">
            <Icon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No {title.toLowerCase()} available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon for updates!</p>
          </div>
        )}
      </div>
    </div>
  );
};
