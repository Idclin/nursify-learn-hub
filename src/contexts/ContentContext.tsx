import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Content, ContentType, TargetLevel } from '@/types';

interface ContentContextType {
  contents: Content[];
  addContent: (content: Omit<Content, 'id' | 'createdAt'>) => void;
  getContentByLevel: (level: number) => Content[];
  getContentByType: (type: ContentType, level?: number) => Content[];
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Mock content for demo
const initialContent: Content[] = [
  {
    id: '1',
    title: 'Introduction to Nursing Fundamentals',
    description: 'Core concepts every nursing student should know',
    type: 'pdf',
    targetLevel: 100,
    createdBy: '2',
    createdAt: new Date(Date.now() - 86400000),
    fileUrl: '/sample.pdf',
  },
  {
    id: '2',
    title: 'Patient Assessment Techniques',
    description: 'Learn how to properly assess patients',
    type: 'video',
    targetLevel: 100,
    createdBy: '2',
    createdAt: new Date(Date.now() - 172800000),
    fileUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
  },
  {
    id: '3',
    title: 'Pharmacology Basics Audio Lesson',
    description: 'Understanding medication administration',
    type: 'audio',
    targetLevel: 200,
    createdBy: '2',
    createdAt: new Date(Date.now() - 259200000),
    fileUrl: '/sample.mp3',
  },
  {
    id: '4',
    title: 'Weekly Study Plan - Week 12',
    description: 'Focus areas and assignments for this week',
    type: 'study_plan',
    targetLevel: 'all',
    createdBy: '2',
    createdAt: new Date(),
    textContent: '## Week 12 Study Plan\n\n- Complete Chapter 15 readings\n- Practice vital signs assessment\n- Review medication calculations',
  },
  {
    id: '5',
    title: 'Clinical Rotation Schedule Update',
    description: 'Important changes to the clinical schedule',
    type: 'announcement',
    targetLevel: 300,
    createdBy: '2',
    createdAt: new Date(),
    textContent: 'Clinical rotations for 300-level students will begin next Monday. Please ensure all documentation is complete.',
  },
  {
    id: '6',
    title: 'Anatomy Reference Chart',
    description: 'Visual guide to human anatomy',
    type: 'image',
    targetLevel: 100,
    createdBy: '2',
    createdAt: new Date(Date.now() - 345600000),
    fileUrl: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600',
  },
];

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contents, setContents] = useState<Content[]>(initialContent);

  const addContent = (content: Omit<Content, 'id' | 'createdAt'>) => {
    const newContent: Content = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setContents(prev => [newContent, ...prev]);
  };

  const getContentByLevel = (level: number) => {
    return contents.filter(
      c => c.targetLevel === level || c.targetLevel === 'all'
    );
  };

  const getContentByType = (type: ContentType, level?: number) => {
    return contents.filter(c => {
      const typeMatch = c.type === type;
      const levelMatch = level ? (c.targetLevel === level || c.targetLevel === 'all') : true;
      return typeMatch && levelMatch;
    });
  };

  return (
    <ContentContext.Provider value={{ contents, addContent, getContentByLevel, getContentByType }}>
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
