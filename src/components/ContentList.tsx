import { useContent, Content } from '@/contexts/ContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { ContentCard } from '@/components/ContentCard';
import { FileText, Video, Music, Megaphone, Calendar, Image, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ContentType = Database['public']['Enums']['content_type'];

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
  const { profile } = useAuth();
  const { contents, isLoading } = useContent();
  
  const userLevel = profile?.level || '100';
  const types = Array.isArray(type) ? type : [type];
  
  // Filter content by user level and type
  const content = contents.filter(c => {
    const typeMatch = types.includes(c.type);
    const levelMatch = c.target_level === 'all' || c.target_level === userLevel;
    return typeMatch && levelMatch;
  });

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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
