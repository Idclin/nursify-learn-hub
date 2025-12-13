import React, { useRef, useEffect, useState } from 'react';
import { Content } from '@/contexts/ContentContext';
import { LevelBadge } from '@/components/LevelBadge';
import { Button } from '@/components/ui/button';
import { 
  FileText, Video, Music, Image, Calendar, Megaphone, Download, 
  ExternalLink, X, Maximize, Minimize, Play, Pause, Volume2, VolumeX,
  SkipBack, SkipForward
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface FullscreenContentViewerProps {
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

const PROGRESS_KEY = 'media-progress';

const getStoredProgress = (contentId: string): number => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      const progress = JSON.parse(stored);
      return progress[contentId] || 0;
    }
  } catch {}
  return 0;
};

const saveProgress = (contentId: string, time: number) => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    const progress = stored ? JSON.parse(stored) : {};
    progress[contentId] = time;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
};

export const FullscreenContentViewer: React.FC<FullscreenContentViewerProps> = ({ 
  content, 
  open, 
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!open || !content) return;
    
    const mediaRef = content.type === 'video' ? videoRef : audioRef;
    if (mediaRef.current && content.file_url) {
      const savedProgress = getStoredProgress(content.id);
      if (savedProgress > 0) {
        mediaRef.current.currentTime = savedProgress;
      }
    }
  }, [open, content]);

  useEffect(() => {
    if (!content) return;
    
    const mediaRef = content.type === 'video' ? videoRef : audioRef;
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
      saveProgress(content.id, media.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
      const savedProgress = getStoredProgress(content.id);
      if (savedProgress > 0 && savedProgress < media.duration - 1) {
        media.currentTime = savedProgress;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      saveProgress(content.id, 0);
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      media.removeEventListener('ended', handleEnded);
    };
  }, [content]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  if (!content || !open) return null;

  const config = contentTypeConfig[content.type];
  const Icon = config.icon;

  const togglePlay = () => {
    const media = content.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
    }
  };

  const toggleMute = () => {
    const media = content.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.muted = !media.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const handleSeek = (value: number[]) => {
    const media = content.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skip = (seconds: number) => {
    const media = content.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.currentTime = Math.max(0, Math.min(media.currentTime + seconds, duration));
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoPlayer = () => (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={content.file_url!}
        className="w-full h-full object-contain"
        poster={content.thumbnail_url || undefined}
        playsInline
      />
      
      {/* Video Controls Overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity',
        showControls ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between">
          <div>
            <h2 className="text-white text-lg font-semibold">{content.title}</h2>
            <p className="text-white/70 text-sm">{config.label}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <Button 
              size="lg" 
              onClick={togglePlay}
              className="pointer-events-auto w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            >
              <Play className="w-8 h-8 text-white fill-white" />
            </Button>
          )}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress bar */}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hover:bg-white/20">
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hover:bg-white/20">
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <span className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudioPlayer = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-b from-green-900/20 to-background">
      <div className={cn('p-8 rounded-full mb-6', config.bgColor)}>
        <Music className={cn('w-20 h-20', config.color)} />
      </div>
      <h2 className="text-xl font-semibold text-center mb-2">{content.title}</h2>
      <p className="text-muted-foreground text-center mb-6">{config.label}</p>
      
      <audio ref={audioRef} src={content.file_url!} className="hidden" />
      
      <div className="w-full max-w-md space-y-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => skip(-10)}>
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button size="lg" onClick={togglePlay} className="w-16 h-16 rounded-full">
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => skip(10)}>
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (content.type) {
      case 'video':
        return content.file_url ? renderVideoPlayer() : (
          <p className="text-muted-foreground text-center py-8">Video not available</p>
        );

      case 'audio':
        return content.file_url ? renderAudioPlayer() : (
          <p className="text-muted-foreground text-center py-8">Audio not available</p>
        );

      case 'pdf':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
              <div className={cn('p-8 rounded-full', config.bgColor)}>
                <FileText className={cn('w-16 h-16', config.color)} />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">{content.title}</h2>
                <p className="text-muted-foreground">{content.description}</p>
              </div>
              <div className="flex gap-3">
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
          </div>
        );

      case 'image':
        return content.file_url ? (
          <div className="flex items-center justify-center h-full p-4 bg-black/50">
            <img 
              src={content.file_url} 
              alt={content.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Image not available</p>
        );

      case 'text':
      case 'study_plan':
      case 'announcement':
        return (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('p-3 rounded-xl', config.bgColor)}>
                    <Icon className={cn('w-6 h-6', config.color)} />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{config.label}</span>
                    <LevelBadge level={content.target_level} className="ml-2" />
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold mb-3">{content.title}</h1>
                
                {content.description && (
                  <p className="text-muted-foreground mb-6">{content.description}</p>
                )}
                
                <p className="text-xs text-muted-foreground mb-6">
                  Posted {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                </p>
                
                {content.text_content && (
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-xl p-6">
                    <p className="whitespace-pre-wrap text-base leading-relaxed">{content.text_content}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-50 bg-background flex flex-col',
        open ? 'animate-in fade-in-0 slide-in-from-bottom-4' : 'hidden'
      )}
    >
      {/* Header - not shown for video */}
      {content.type !== 'video' && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
              <span className="font-medium truncate max-w-[200px]">{content.title}</span>
            </div>
            {(content.type === 'image' || content.type === 'audio') && (
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </header>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};
