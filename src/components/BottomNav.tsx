import { Home, FileText, Video, Music, Megaphone, Settings, Upload, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const studentTabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'notes', icon: FileText, label: 'Notes' },
  { id: 'videos', icon: Video, label: 'Videos' },
  { id: 'audio', icon: Music, label: 'Audio' },
  { id: 'announcements', icon: Megaphone, label: 'News' },
];

const teacherTabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'notifications', icon: Bell, label: 'Notify' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { profile } = useAuth();
  const tabs = profile?.role === 'teacher' ? teacherTabs : studentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <tab.icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
