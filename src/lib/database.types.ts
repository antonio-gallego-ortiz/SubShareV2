export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          name: string
          logo: string | null
          price: number
          billing_cycle: 'month' | 'year'
          owner_id: string | null
          next_renewal: string | null
          payment_method: string | null
          total_members: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo?: string | null
          price: number
          billing_cycle: 'month' | 'year'
          owner_id?: string | null
          next_renewal?: string | null
          payment_method?: string | null
          total_members?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo?: string | null
          price?: number
          billing_cycle?: 'month' | 'year'
          owner_id?: string | null
          next_renewal?: string | null
          payment_method?: string | null
          total_members?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_members: {
        Row: {
          id: string
          subscription_id: string | null
          user_id: string | null
          amount: number
          is_owner: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          subscription_id?: string | null
          user_id?: string | null
          amount: number
          is_owner?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string | null
          user_id?: string | null
          amount?: number
          is_owner?: boolean
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_members_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          subscription_id: string | null
          member_id: string | null
          amount: number
          status: 'paid' | 'pending' | 'auto-paid' | 'failed'
          payment_date: string | null
          due_date: string | null
          billing_period_start: string | null
          billing_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subscription_id?: string | null
          member_id?: string | null
          amount: number
          status: 'paid' | 'pending' | 'auto-paid' | 'failed'
          payment_date?: string | null
          due_date?: string | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string | null
          member_id?: string | null
          amount?: number
          status?: 'paid' | 'pending' | 'auto-paid' | 'failed'
          payment_date?: string | null
          due_date?: string | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "subscription_members"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          message: string
          type: 'payment' | 'reminder' | 'invitation' | 'update'
          is_read: boolean
          related_subscription_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          message: string
          type: 'payment' | 'reminder' | 'invitation' | 'update'
          is_read?: boolean
          related_subscription_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          message?: string
          type?: 'payment' | 'reminder' | 'invitation' | 'update'
          is_read?: boolean
          related_subscription_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_subscription_id_fkey"
            columns: ["related_subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      invitations: {
        Row: {
          id: string
          subscription_id: string | null
          inviter_id: string | null
          invitee_email: string
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          token: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id?: string | null
          inviter_id?: string | null
          invitee_email: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          token: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string | null
          inviter_id?: string | null
          invitee_email?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          token?: string
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
