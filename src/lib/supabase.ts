import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          email: string
          wallet_address: string | null
          avatar: string | null
          bio: string | null
          total_rewards: number
          role: string
          is_verified: boolean
          experience: number
          posts: number
          level: number
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      threads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          category: string
          author_id: string
          is_pinned: boolean
          views: number
          likes: number
        }
        Insert: Omit<Database['public']['Tables']['threads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['threads']['Insert']>
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          content: string
          thread_id: string
          author_id: string
          likes: number
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      shoutbox: {
        Row: {
          id: string
          created_at: string
          user_id: string
          message: string
        }
        Insert: Omit<Database['public']['Tables']['shoutbox']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['shoutbox']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          amount: number
          type: string
          status: string
          signature: string | null
          description: string | null
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
    }
  }
}