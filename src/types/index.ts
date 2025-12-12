export type UserRole = 'student' | 'teacher';
export type StudentLevel = 100 | 200 | 300;
export type ContentType = 'pdf' | 'text' | 'audio' | 'video' | 'image' | 'study_plan' | 'announcement';
export type TargetLevel = 100 | 200 | 300 | 'all';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  level?: StudentLevel;
  fullName: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  fileUrl?: string;
  textContent?: string;
  targetLevel: TargetLevel;
  createdBy: string;
  createdAt: Date;
  thumbnailUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  contentId?: string;
  targetLevel: TargetLevel;
  read: boolean;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  contentId: string;
  createdAt: Date;
}
