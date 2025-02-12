import { PostgrestError } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'organization';
  createdAt: Date;
}

export type DatabaseError = PostgrestError;

export interface Poll {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  isAnonymous: boolean;
  isPublic: boolean;
  category?: string;
  subcategory?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: Date;
  expiresAt?: Date;
  questions: Question[];
}

export interface Question {
  id?: string;
  text: string;
  type: 'multiple_choice' | 'ranking' | 'text';
  options?: string[];
  required: boolean;
}

export interface Response {
  id: string;
  pollId: string;
  userId?: string;
  answers: Answer[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: Date;
}

export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface PollCategory {
  id: string;
  subcategory: string;
}

export interface PollFormData {
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
  questions: Question[];
  isAnonymous: boolean;
  isPublic: boolean;
  expiresAt: string | null;
  points_enabled?: boolean;
  points_per_completion?: number;
  theme_id?: string;
  template_id?: string;
  conditional_logic?: Record<string, any>;
export interface PollResponse {
  id: string;
  poll_id: string;
  user_id?: string;
  answers: Answer[];
  created_at: string;
}

export interface PollQuestion {
  id: string;
  poll_id: string;
  text: string;
  type: 'multiple_choice' | 'text';
  options?: string[];
  required: boolean;
  created_at: string;
}

export interface PollResult {
  id: string;
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
  created_at: string;
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options: string[];
    responses: Array<{
      option: string;
      count: number;
    }>;
  }>;
  total_responses: number;
}