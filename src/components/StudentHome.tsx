import { useAuth } from '@/contexts/AuthContext';
import { useContent, Content } from '@/contexts/ContentContext';
import { ContentCard } from '@/components/ContentCard';
import { LevelBadge } from '@/components/LevelBadge';
import { Bell, Search, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const StudentHome: React.FC = () => {
  const { profile } = useAuth();
  const { contents, isLoading } = useContent();
  
  const userLevel = profile?.level || '100';
  
  // Filter content by user level
  const filteredContent = contents.filter(
    c => c.target_level === 'all' || c.target_level === userLevel
  );
  const recentContent = filteredContent.slice(0, 6);

  // Count by type
  const noteCount = filteredContent.filter(c => c.type === 'pdf' || c.type === 'text').length;
  const videoCount = filteredContent.filter(c => c.type === 'video').length;
  const audioCount = filteredContent.filter(c => c.type === 'audio').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-hero sticky top-0 z-40 safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="text-xl font-semibold">{profile?.full_name || 'Student'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <LevelBadge level={userLevel} className="text-sm px-3 py-1" />
            <span className="text-sm text-muted-foreground">Nursing Program</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search notes, videos, lessons..."
              className="pl-10 bg-card/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          <QuickStatCard label="Notes" count={noteCount} color="bg-info/10 text-info" />
          <QuickStatCard label="Videos" count={videoCount} color="bg-purple-500/10 text-purple-600" />
          <QuickStatCard label="Audio" count={audioCount} color="bg-success/10 text-success" />
        </div>
      </section>

      {/* Recent Content */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Updates</h2>
          <Button variant="link" className="text-sm p-0 h-auto">View all</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {recentContent.map(item => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        )}

        {!isLoading && recentContent.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No content available for your level yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon for updates!</p>
          </div>
        )}
      </section>
    </div>
  );
};

interface QuickStatCardProps {
  label: string;
  count: number;
  color: string;
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({ label, count, color }) => (
  <div className="bg-card rounded-xl p-4 text-center shadow-sm border">
    <p className={`text-2xl font-bold ${color.split(' ')[1]}`}>{count}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);
