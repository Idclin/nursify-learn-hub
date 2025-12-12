import { TargetLevel } from '@/types';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: TargetLevel;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className }) => {
  const getLevelStyles = () => {
    switch (level) {
      case 100:
        return 'bg-info/10 text-info border-info/20';
      case 200:
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 300:
        return 'bg-primary/10 text-primary border-primary/20';
      case 'all':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getLevelStyles(),
        className
      )}
    >
      {level === 'all' ? 'All Levels' : `Level ${level}`}
    </span>
  );
};
