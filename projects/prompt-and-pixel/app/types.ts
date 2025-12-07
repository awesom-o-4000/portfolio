export interface Creator {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  coverImage: string;
  available: boolean;
  stats: {
    successRate: number;
    responseTime: string;
    completedJobs: number;
  };
  techStack: string[];
}

export interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  creatorId: string;
  model: string;
  likes: number;
  promptSnippet?: string;
  promptPrice: string;
  downloadPrice: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  budget: string;
  type: 'Fixed Price' | 'Hourly';
  tags: string[];
  postedAt: string;
  description: string;
}

export interface Topic {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  replies: number;
  views: string;
  isHot?: boolean;
  preview: string;
}

export type ViewType = 'feed' | 'profile' | 'jobs' | 'creators' | 'community' | 'search' | 'artwork' | 'create-profile';

export interface HireFormData {
  jobType: 'commission' | 'remix';
  brief: string;
  model: string;
  budget: string;
}