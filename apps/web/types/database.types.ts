export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          config: Json;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          config: Json;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          config?: Json;
          user_id?: string;
        };
      };
      analytics_events: {
        Row: {
          id: number;
          created_at: string;
          project_id: string;
          event_type: string;
          metadata: Json;
        };
        Insert: {
          id?: number;
          created_at?: string;
          project_id: string;
          event_type: string;
          metadata?: Json;
        };
        Update: {
          id?: number;
          created_at?: string;
          project_id?: string;
          event_type?: string;
          metadata?: Json;
        };
      };
    };
  };
}
