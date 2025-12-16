import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ContentRow = Database['public']['Tables']['content']['Row'];
type ContentType = Database['public']['Enums']['content_type'];
type TargetLevel = Database['public']['Enums']['target_level'];

export interface Content {
  id: string;
  title: string;
  description: string | null;
  type: ContentType;
  file_url: string | null;
  text_content: string | null;
  thumbnail_url: string | null;
  target_level: TargetLevel;
  created_by: string;
  created_at: string;
}

interface ContentContextType {
  contents: Content[];
  isLoading: boolean;
  addContent: (content: {
    title: string;
    description?: string;
    type: ContentType;
    target_level: TargetLevel;
    file_url?: string;
    text_content?: string;
    thumbnail_url?: string;
  }) => Promise<void>;
  deleteContent: (contentId: string) => Promise<void>;
  uploadFile: (file: File, folder: string) => Promise<string | null>;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchContent = async () => {
    if (!user) {
      setContents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      } else {
        setContents(data || []);
      }
    } catch (error) {
      console.error('Error in fetchContent:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchContent();
    } else {
      setContents([]);
      setIsLoading(false);
    }
  }, [user]);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('content-files')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload file');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('content-files')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const addContent = async (content: {
    title: string;
    description?: string;
    type: ContentType;
    target_level: TargetLevel;
    file_url?: string;
    text_content?: string;
    thumbnail_url?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content')
        .insert({
          title: content.title,
          description: content.description || null,
          type: content.type,
          target_level: content.target_level,
          file_url: content.file_url || null,
          text_content: content.text_content || null,
          thumbnail_url: content.thumbnail_url || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding content:', error);
        toast.error('Failed to add content');
        return;
      }

      // Create notification for students
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          title: `New ${content.type} uploaded`,
          message: content.title,
          content_id: data.id,
          target_level: content.target_level,
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }

      setContents(prev => [data, ...prev]);
      toast.success('Content uploaded successfully!');
    } catch (error) {
      console.error('Error in addContent:', error);
      toast.error('Failed to add content');
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) {
        console.error('Error deleting content:', error);
        toast.error('Failed to delete content');
        return;
      }

      setContents(prev => prev.filter(c => c.id !== contentId));
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error in deleteContent:', error);
      toast.error('Failed to delete content');
    }
  };

  const refreshContent = async () => {
    await fetchContent();
  };

  return (
    <ContentContext.Provider value={{ contents, isLoading, addContent, deleteContent, uploadFile, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
