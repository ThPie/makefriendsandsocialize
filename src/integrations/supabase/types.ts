export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: []
      }
      admin_mfa_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          session_token: string | null
          user_agent: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          session_token?: string | null
          user_agent?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          session_token?: string | null
          user_agent?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      admin_mfa_status: {
        Row: {
          created_at: string | null
          id: string
          last_mfa_verified_at: string | null
          mfa_enabled: boolean | null
          mfa_required_since: string | null
          totp_secret_encrypted: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_mfa_verified_at?: string | null
          mfa_enabled?: boolean | null
          mfa_required_since?: string | null
          totp_secret_encrypted?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_mfa_verified_at?: string | null
          mfa_enabled?: boolean | null
          mfa_required_since?: string | null
          totp_secret_encrypted?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_rate_limits: {
        Row: {
          admin_user_id: string
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_properties: Json | null
          id: string
          ip_hash: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_properties?: Json | null
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_properties?: Json | null
          id?: string
          ip_hash?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      appeal_status_history: {
        Row: {
          admin_notes: string | null
          appeal_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          admin_notes?: string | null
          appeal_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          admin_notes?: string | null
          appeal_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: []
      }
      application_waitlist: {
        Row: {
          admin_notes: string | null
          favorite_brands: string[] | null
          id: string
          industry: string | null
          interests: string[] | null
          job_title: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["application_status"]
          style_description: string | null
          submitted_at: string
          user_id: string
          values_in_partner: string | null
        }
        Insert: {
          admin_notes?: string | null
          favorite_brands?: string[] | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          job_title?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          style_description?: string | null
          submitted_at?: string
          user_id: string
          values_in_partner?: string | null
        }
        Update: {
          admin_notes?: string | null
          favorite_brands?: string[] | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          job_title?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          style_description?: string | null
          submitted_at?: string
          user_id?: string
          values_in_partner?: string | null
        }
        Relationships: []
      }
      blog_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "journal_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "journal_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "journal_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      business_introduction_requests: {
        Row: {
          business_id: string
          created_at: string
          id: string
          message: string | null
          requester_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          message?: string | null
          requester_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          message?: string | null
          requester_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_introduction_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          business_name: string
          category: string | null
          connection_count: number | null
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          is_visible: boolean
          location: string | null
          logo_url: string | null
          services: string[] | null
          status: Database["public"]["Enums"]["business_status"]
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          business_name: string
          category?: string | null
          connection_count?: number | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_visible?: boolean
          location?: string | null
          logo_url?: string | null
          services?: string[] | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          business_name?: string
          category?: string | null
          connection_count?: number | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_visible?: boolean
          location?: string | null
          logo_url?: string | null
          services?: string[] | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      business_verification_reports: {
        Row: {
          ai_recommendation: string | null
          business_id: string
          created_at: string
          findings: Json | null
          id: string
          positive_signals: string[] | null
          red_flags: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          sources_checked: string[] | null
          status: string
          verification_score: number | null
        }
        Insert: {
          ai_recommendation?: string | null
          business_id: string
          created_at?: string
          findings?: Json | null
          id?: string
          positive_signals?: string[] | null
          red_flags?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sources_checked?: string[] | null
          status?: string
          verification_score?: number | null
        }
        Update: {
          ai_recommendation?: string | null
          business_id?: string
          created_at?: string
          findings?: Json | null
          id?: string
          positive_signals?: string[] | null
          red_flags?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sources_checked?: string[] | null
          status?: string
          verification_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_verification_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_metadata: {
        Row: {
          cache_data: Json
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          ttl_seconds: number
        }
        Insert: {
          cache_data: Json
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
          ttl_seconds?: number
        }
        Update: {
          cache_data?: Json
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          ttl_seconds?: number
        }
        Relationships: []
      }
      circle_application_contacts: {
        Row: {
          application_id: string
          created_at: string | null
          email_encrypted: string
          id: string
          instagram_linkedin_encrypted: string | null
          updated_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          email_encrypted: string
          id?: string
          instagram_linkedin_encrypted?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          email_encrypted?: string
          id?: string
          instagram_linkedin_encrypted?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_application_contacts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "circle_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_applications: {
        Row: {
          admin_notes: string | null
          circle_name: string
          comfortable_speaking: boolean | null
          created_at: string | null
          dress_code_commitment: boolean | null
          email: string
          french_level: string | null
          full_name: string
          id: string
          improvement_goals: string | null
          instagram_linkedin: string | null
          membership_tier: string
          reason_to_join: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          style_preference: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          circle_name: string
          comfortable_speaking?: boolean | null
          created_at?: string | null
          dress_code_commitment?: boolean | null
          email: string
          french_level?: string | null
          full_name: string
          id?: string
          improvement_goals?: string | null
          instagram_linkedin?: string | null
          membership_tier: string
          reason_to_join?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          style_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          circle_name?: string
          comfortable_speaking?: boolean | null
          created_at?: string | null
          dress_code_commitment?: boolean | null
          email?: string
          french_level?: string | null
          full_name?: string
          id?: string
          improvement_goals?: string | null
          instagram_linkedin?: string | null
          membership_tier?: string
          reason_to_join?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          style_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          message: string | null
          requested_id: string
          requester_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          requested_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          requested_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_requested_id_fkey"
            columns: ["requested_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quotes: {
        Row: {
          created_at: string
          id: string
          quote_date: string
          quote_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          quote_date: string
          quote_text: string
        }
        Update: {
          created_at?: string
          id?: string
          quote_date?: string
          quote_text?: string
        }
        Relationships: []
      }
      date_confirmation_requests: {
        Row: {
          confirmation_token: string
          confirmed_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          meeting_proposal_id: string
          response_notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          confirmation_token: string
          confirmed_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          meeting_proposal_id: string
          response_notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          meeting_proposal_id?: string
          response_notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_confirmation_requests_meeting_proposal_id_fkey"
            columns: ["meeting_proposal_id"]
            isOneToOne: false
            referencedRelation: "meeting_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_matches: {
        Row: {
          admin_notes: string | null
          compatibility_score: number
          created_at: string | null
          id: string
          match_dimensions: Json | null
          match_reason: string
          meeting_date: string | null
          meeting_status: string | null
          meeting_time: string | null
          status: string | null
          updated_at: string | null
          user_a_id: string
          user_a_response: string | null
          user_b_id: string
          user_b_response: string | null
        }
        Insert: {
          admin_notes?: string | null
          compatibility_score: number
          created_at?: string | null
          id?: string
          match_dimensions?: Json | null
          match_reason: string
          meeting_date?: string | null
          meeting_status?: string | null
          meeting_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_a_id: string
          user_a_response?: string | null
          user_b_id: string
          user_b_response?: string | null
        }
        Update: {
          admin_notes?: string | null
          compatibility_score?: number
          created_at?: string | null
          id?: string
          match_dimensions?: Json | null
          match_reason?: string
          meeting_date?: string | null
          meeting_status?: string | null
          meeting_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_a_id?: string
          user_a_response?: string | null
          user_b_id?: string
          user_b_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dating_matches_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "dating_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_matches_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "dating_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_meeting_reminders: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          meeting_proposal_id: string
          reminder_type: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          meeting_proposal_id: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          meeting_proposal_id?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dating_meeting_reminders_meeting_proposal_id_fkey"
            columns: ["meeting_proposal_id"]
            isOneToOne: false
            referencedRelation: "meeting_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_profile_sensitive_data: {
        Row: {
          created_at: string | null
          dating_profile_id: string
          encryption_key_id: string | null
          facebook_url_encrypted: string | null
          id: string
          instagram_url_encrypted: string | null
          linkedin_url_encrypted: string | null
          phone_number_encrypted: string | null
          twitter_url_encrypted: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dating_profile_id: string
          encryption_key_id?: string | null
          facebook_url_encrypted?: string | null
          id?: string
          instagram_url_encrypted?: string | null
          linkedin_url_encrypted?: string | null
          phone_number_encrypted?: string | null
          twitter_url_encrypted?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dating_profile_id?: string
          encryption_key_id?: string | null
          facebook_url_encrypted?: string | null
          id?: string
          instagram_url_encrypted?: string | null
          linkedin_url_encrypted?: string | null
          phone_number_encrypted?: string | null
          twitter_url_encrypted?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dating_profile_sensitive_data_dating_profile_id_fkey"
            columns: ["dating_profile_id"]
            isOneToOne: true
            referencedRelation: "dating_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_profiles: {
        Row: {
          accountability_reflection: string | null
          age: number
          age_range_max: number
          age_range_min: number
          apology_language: string | null
          attachment_style: string | null
          been_married: boolean | null
          bio: string | null
          career_ambition: string | null
          children_details: string | null
          communication_style: string | null
          compatibility_dimensions: Json | null
          conflict_resolution: string | null
          conflict_style_normalized: Json | null
          connection_style_normalized: Json | null
          core_values: string | null
          core_values_ranked: string[] | null
          created_at: string | null
          current_curiosity: string | null
          dealbreakers: string | null
          debt_status: string | null
          defining_enough: string | null
          diet_preference: string | null
          display_name: string
          drinking_status: string | null
          drug_use: string | null
          email_notifications_enabled: boolean | null
          emotional_connection: string | null
          ex_admiration: string | null
          exercise_frequency: string | null
          family_involvement_expectation: string | null
          family_relationship: string | null
          financial_philosophy: string | null
          friendship_benchmark: string | null
          future_goals: string | null
          gender: string
          geographic_flexibility: string | null
          growth_work: string | null
          has_children: boolean | null
          id: string
          introvert_extrovert: string | null
          is_active: boolean | null
          last_preprocessed_at: string | null
          lifestyle_normalized: Json | null
          location: string | null
          love_language: string | null
          marriage_history: string | null
          marriage_timeline: string | null
          morning_night_person: string | null
          occupation: string | null
          past_relationship_learning: string | null
          paused_at: string | null
          paused_reason: string | null
          photo_url: string | null
          political_issues: string[] | null
          politics_stance: string | null
          push_notifications_enabled: boolean | null
          raise_children_faith: string | null
          relationship_type: string | null
          religion_stance: string | null
          religious_practice: string | null
          repair_attempt_response: string | null
          screen_time_habits: string | null
          search_radius: number | null
          smoking_status: string | null
          sms_notifications_enabled: boolean | null
          social_verification_notes: string | null
          social_verification_status: string | null
          status: string
          stress_response: string | null
          support_style: string | null
          target_gender: string
          ten_year_vision: string | null
          trust_fidelity_views: string | null
          tuesday_night_test: string | null
          unpopular_opinion: string | null
          updated_at: string | null
          user_id: string
          vulnerability_check: string | null
          wants_children: string | null
        }
        Insert: {
          accountability_reflection?: string | null
          age: number
          age_range_max?: number
          age_range_min?: number
          apology_language?: string | null
          attachment_style?: string | null
          been_married?: boolean | null
          bio?: string | null
          career_ambition?: string | null
          children_details?: string | null
          communication_style?: string | null
          compatibility_dimensions?: Json | null
          conflict_resolution?: string | null
          conflict_style_normalized?: Json | null
          connection_style_normalized?: Json | null
          core_values?: string | null
          core_values_ranked?: string[] | null
          created_at?: string | null
          current_curiosity?: string | null
          dealbreakers?: string | null
          debt_status?: string | null
          defining_enough?: string | null
          diet_preference?: string | null
          display_name: string
          drinking_status?: string | null
          drug_use?: string | null
          email_notifications_enabled?: boolean | null
          emotional_connection?: string | null
          ex_admiration?: string | null
          exercise_frequency?: string | null
          family_involvement_expectation?: string | null
          family_relationship?: string | null
          financial_philosophy?: string | null
          friendship_benchmark?: string | null
          future_goals?: string | null
          gender: string
          geographic_flexibility?: string | null
          growth_work?: string | null
          has_children?: boolean | null
          id?: string
          introvert_extrovert?: string | null
          is_active?: boolean | null
          last_preprocessed_at?: string | null
          lifestyle_normalized?: Json | null
          location?: string | null
          love_language?: string | null
          marriage_history?: string | null
          marriage_timeline?: string | null
          morning_night_person?: string | null
          occupation?: string | null
          past_relationship_learning?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          photo_url?: string | null
          political_issues?: string[] | null
          politics_stance?: string | null
          push_notifications_enabled?: boolean | null
          raise_children_faith?: string | null
          relationship_type?: string | null
          religion_stance?: string | null
          religious_practice?: string | null
          repair_attempt_response?: string | null
          screen_time_habits?: string | null
          search_radius?: number | null
          smoking_status?: string | null
          sms_notifications_enabled?: boolean | null
          social_verification_notes?: string | null
          social_verification_status?: string | null
          status?: string
          stress_response?: string | null
          support_style?: string | null
          target_gender: string
          ten_year_vision?: string | null
          trust_fidelity_views?: string | null
          tuesday_night_test?: string | null
          unpopular_opinion?: string | null
          updated_at?: string | null
          user_id: string
          vulnerability_check?: string | null
          wants_children?: string | null
        }
        Update: {
          accountability_reflection?: string | null
          age?: number
          age_range_max?: number
          age_range_min?: number
          apology_language?: string | null
          attachment_style?: string | null
          been_married?: boolean | null
          bio?: string | null
          career_ambition?: string | null
          children_details?: string | null
          communication_style?: string | null
          compatibility_dimensions?: Json | null
          conflict_resolution?: string | null
          conflict_style_normalized?: Json | null
          connection_style_normalized?: Json | null
          core_values?: string | null
          core_values_ranked?: string[] | null
          created_at?: string | null
          current_curiosity?: string | null
          dealbreakers?: string | null
          debt_status?: string | null
          defining_enough?: string | null
          diet_preference?: string | null
          display_name?: string
          drinking_status?: string | null
          drug_use?: string | null
          email_notifications_enabled?: boolean | null
          emotional_connection?: string | null
          ex_admiration?: string | null
          exercise_frequency?: string | null
          family_involvement_expectation?: string | null
          family_relationship?: string | null
          financial_philosophy?: string | null
          friendship_benchmark?: string | null
          future_goals?: string | null
          gender?: string
          geographic_flexibility?: string | null
          growth_work?: string | null
          has_children?: boolean | null
          id?: string
          introvert_extrovert?: string | null
          is_active?: boolean | null
          last_preprocessed_at?: string | null
          lifestyle_normalized?: Json | null
          location?: string | null
          love_language?: string | null
          marriage_history?: string | null
          marriage_timeline?: string | null
          morning_night_person?: string | null
          occupation?: string | null
          past_relationship_learning?: string | null
          paused_at?: string | null
          paused_reason?: string | null
          photo_url?: string | null
          political_issues?: string[] | null
          politics_stance?: string | null
          push_notifications_enabled?: boolean | null
          raise_children_faith?: string | null
          relationship_type?: string | null
          religion_stance?: string | null
          religious_practice?: string | null
          repair_attempt_response?: string | null
          screen_time_habits?: string | null
          search_radius?: number | null
          smoking_status?: string | null
          sms_notifications_enabled?: boolean | null
          social_verification_notes?: string | null
          social_verification_status?: string | null
          status?: string
          stress_response?: string | null
          support_style?: string | null
          target_gender?: string
          ten_year_vision?: string | null
          trust_fidelity_views?: string | null
          tuesday_night_test?: string | null
          unpopular_opinion?: string | null
          updated_at?: string | null
          user_id?: string
          vulnerability_check?: string | null
          wants_children?: string | null
        }
        Relationships: []
      }
      dunning_retry_log: {
        Row: {
          created_at: string
          error_message: string | null
          executed_at: string | null
          id: string
          membership_id: string | null
          retry_number: number
          scheduled_at: string
          status: string | null
          stripe_invoice_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          membership_id?: string | null
          retry_number: number
          scheduled_at: string
          status?: string | null
          stripe_invoice_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          membership_id?: string | null
          retry_number?: number
          scheduled_at?: string
          status?: string | null
          stripe_invoice_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dunning_retry_log_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      event_photos: {
        Row: {
          category: string | null
          created_at: string | null
          display_order: number | null
          event_id: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string | null
          id: string
          reminder_type: string | null
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          reminder_type?: string | null
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          reminder_type?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          guest_count: number | null
          guest_names: string[] | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_count?: number | null
          guest_names?: string[] | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_count?: number | null
          guest_names?: string[] | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_waitlist: {
        Row: {
          created_at: string
          event_id: string
          id: string
          notified_at: string | null
          position: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          notified_at?: string | null
          position: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          notified_at?: string | null
          position?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_waitlist_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string
          currency: string | null
          date: string
          description: string | null
          external_url: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          registration_deadline: string | null
          rsvp_count: number | null
          source: string | null
          status: string
          tags: string[] | null
          ticket_price: number | null
          tier: Database["public"]["Enums"]["membership_tier"]
          time: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
          waitlist_enabled: boolean | null
        }
        Insert: {
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          date: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          registration_deadline?: string | null
          rsvp_count?: number | null
          source?: string | null
          status?: string
          tags?: string[] | null
          ticket_price?: number | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          time?: string | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          waitlist_enabled?: boolean | null
        }
        Update: {
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          date?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          registration_deadline?: string | null
          rsvp_count?: number | null
          source?: string | null
          status?: string
          tags?: string[] | null
          ticket_price?: number | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          time?: string | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          waitlist_enabled?: boolean | null
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string | null
          id: string
          image_url: string
          order_index: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          image_url: string
          order_index?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          image_url?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_history: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string | null
          description: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_number: string | null
          paid_at: string | null
          pdf_url: string | null
          period_end: string | null
          period_start: string | null
          status: string
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string | null
          description?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_number?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_number?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          audience_segment: string | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string
          discovered_at: string
          discovery_run_id: string | null
          id: string
          is_automated: boolean | null
          lead_email: string | null
          lead_interests: string[] | null
          lead_location: string | null
          lead_name: string | null
          notes: string | null
          outreach_suggestion: string | null
          raw_content: string | null
          relevance_score: number | null
          source_platform: string
          source_url: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          audience_segment?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          discovered_at?: string
          discovery_run_id?: string | null
          id?: string
          is_automated?: boolean | null
          lead_email?: string | null
          lead_interests?: string[] | null
          lead_location?: string | null
          lead_name?: string | null
          notes?: string | null
          outreach_suggestion?: string | null
          raw_content?: string | null
          relevance_score?: number | null
          source_platform: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          audience_segment?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          discovered_at?: string
          discovery_run_id?: string | null
          id?: string
          is_automated?: boolean | null
          lead_email?: string | null
          lead_interests?: string[] | null
          lead_location?: string | null
          lead_name?: string | null
          notes?: string | null
          outreach_suggestion?: string | null
          raw_content?: string | null
          relevance_score?: number | null
          source_platform?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      match_reveal_purchases: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          purchase_type: string
          purchased_at: string
          reveals_total: number
          reveals_used: number
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          purchase_type: string
          purchased_at?: string
          reveals_total?: number
          reveals_used?: number
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          purchase_type?: string
          purchased_at?: string
          reveals_total?: number
          reveals_used?: number
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      match_reveals: {
        Row: {
          id: string
          match_id: string
          purchase_id: string | null
          revealed_at: string
          revealed_via: string
          user_id: string
        }
        Insert: {
          id?: string
          match_id: string
          purchase_id?: string | null
          revealed_at?: string
          revealed_via: string
          user_id: string
        }
        Update: {
          id?: string
          match_id?: string
          purchase_id?: string | null
          revealed_at?: string
          revealed_via?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_reveals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "dating_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_reveals_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "match_reveal_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_proposals: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          proposed_by: string
          proposed_date: string
          proposed_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          proposed_by: string
          proposed_date: string
          proposed_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          proposed_by?: string
          proposed_date?: string
          proposed_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_proposals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "dating_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_proposals_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "dating_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetup_stats: {
        Row: {
          avatar_urls: string[] | null
          created_at: string
          id: string
          joined_this_week: number | null
          last_updated: string
          meetup_url: string | null
          member_count: number
          previous_member_count: number | null
          rating: number | null
        }
        Insert: {
          avatar_urls?: string[] | null
          created_at?: string
          id?: string
          joined_this_week?: number | null
          last_updated?: string
          meetup_url?: string | null
          member_count?: number
          previous_member_count?: number | null
          rating?: number | null
        }
        Update: {
          avatar_urls?: string[] | null
          created_at?: string
          id?: string
          joined_this_week?: number | null
          last_updated?: string
          meetup_url?: string | null
          member_count?: number
          previous_member_count?: number | null
          rating?: number | null
        }
        Relationships: []
      }
      member_badges: {
        Row: {
          badge_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      member_security_reports: {
        Row: {
          admin_decision: string | null
          admin_notes: string | null
          ai_recommendation:
            | Database["public"]["Enums"]["security_recommendation"]
            | null
          created_at: string
          findings: Json | null
          id: string
          identity_score: number | null
          positive_signals: string[] | null
          red_flags: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_assessment: string | null
          scan_type: Database["public"]["Enums"]["security_scan_type"]
          scanned_at: string | null
          severity: Database["public"]["Enums"]["security_severity"] | null
          social_consistency_score: number | null
          sources_checked: string[] | null
          status: Database["public"]["Enums"]["security_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_decision?: string | null
          admin_notes?: string | null
          ai_recommendation?:
            | Database["public"]["Enums"]["security_recommendation"]
            | null
          created_at?: string
          findings?: Json | null
          id?: string
          identity_score?: number | null
          positive_signals?: string[] | null
          red_flags?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_assessment?: string | null
          scan_type?: Database["public"]["Enums"]["security_scan_type"]
          scanned_at?: string | null
          severity?: Database["public"]["Enums"]["security_severity"] | null
          social_consistency_score?: number | null
          sources_checked?: string[] | null
          status?: Database["public"]["Enums"]["security_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_decision?: string | null
          admin_notes?: string | null
          ai_recommendation?:
            | Database["public"]["Enums"]["security_recommendation"]
            | null
          created_at?: string
          findings?: Json | null
          id?: string
          identity_score?: number | null
          positive_signals?: string[] | null
          red_flags?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_assessment?: string | null
          scan_type?: Database["public"]["Enums"]["security_scan_type"]
          scanned_at?: string | null
          severity?: Database["public"]["Enums"]["security_severity"] | null
          social_consistency_score?: number | null
          sources_checked?: string[] | null
          status?: Database["public"]["Enums"]["security_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_security_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_security_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_trials: {
        Row: {
          converted_at: string | null
          created_at: string
          ends_at: string
          id: string
          started_at: string
          stripe_subscription_id: string | null
          tier: string
          user_id: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          started_at?: string
          stripe_subscription_id?: string | null
          tier: string
          user_id: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          started_at?: string
          stripe_subscription_id?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          dunning_status: string | null
          expires_at: string | null
          failed_payment_count: number | null
          id: string
          last_payment_attempt_at: string | null
          last_payment_error: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["membership_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dunning_status?: string | null
          expires_at?: string | null
          failed_payment_count?: number | null
          id?: string
          last_payment_attempt_at?: string | null
          last_payment_error?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dunning_status?: string | null
          expires_at?: string | null
          failed_payment_count?: number | null
          id?: string
          last_payment_attempt_at?: string | null
          last_payment_error?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          is_read: boolean
          notification_type: string
          payload: Json
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          is_read?: boolean
          notification_type: string
          payload?: Json
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          is_read?: boolean
          notification_type?: string
          payload?: Json
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_throttle_log: {
        Row: {
          bundled_count: number
          created_at: string | null
          id: string
          last_notification_at: string | null
          notification_date: string
          notifications_sent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bundled_count?: number
          created_at?: string | null
          id?: string
          last_notification_at?: string | null
          notification_date?: string
          notifications_sent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bundled_count?: number
          created_at?: string | null
          id?: string
          last_notification_at?: string | null
          notification_date?: string
          notifications_sent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      oauth_rate_limits: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          failed_attempts: number | null
          id: string
          ip_address: string
          last_attempt_at: string | null
          requires_captcha: boolean | null
          window_hour: string
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          ip_address: string
          last_attempt_at?: string | null
          requires_captcha?: boolean | null
          window_hour: string
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          ip_address?: string
          last_attempt_at?: string | null
          requires_captcha?: boolean | null
          window_hour?: string
        }
        Relationships: []
      }
      pending_notification_bundle: {
        Row: {
          bundled_into: string | null
          created_at: string | null
          id: string
          notification_type: string
          payload: Json
          priority: number
          processed_at: string | null
          user_id: string
        }
        Insert: {
          bundled_into?: string | null
          created_at?: string | null
          id?: string
          notification_type: string
          payload?: Json
          priority?: number
          processed_at?: string | null
          user_id: string
        }
        Update: {
          bundled_into?: string | null
          created_at?: string | null
          id?: string
          notification_type?: string
          payload?: Json
          priority?: number
          processed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_notification_bundle_bundled_into_fkey"
            columns: ["bundled_into"]
            isOneToOne: false
            referencedRelation: "notification_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_urls: string[] | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email_reminders_enabled: boolean | null
          favorite_brands: string[] | null
          first_name: string | null
          id: string
          industry: string | null
          interests: string[] | null
          is_security_verified: boolean | null
          is_visible: boolean | null
          job_title: string | null
          last_name: string | null
          last_scanned_at: string | null
          marketing_emails_enabled: boolean | null
          onboarding_completed: boolean | null
          profile_completed_at: string | null
          referral_code: string | null
          referral_count: number | null
          referral_notifications_enabled: boolean | null
          referred_by: string | null
          reminder_hours_before: number | null
          signature_style: string | null
          state: string | null
          terms_accepted_at: string | null
          updated_at: string
          values_in_partner: string | null
          verified_at: string | null
        }
        Insert: {
          avatar_urls?: string[] | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email_reminders_enabled?: boolean | null
          favorite_brands?: string[] | null
          first_name?: string | null
          id: string
          industry?: string | null
          interests?: string[] | null
          is_security_verified?: boolean | null
          is_visible?: boolean | null
          job_title?: string | null
          last_name?: string | null
          last_scanned_at?: string | null
          marketing_emails_enabled?: boolean | null
          onboarding_completed?: boolean | null
          profile_completed_at?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referral_notifications_enabled?: boolean | null
          referred_by?: string | null
          reminder_hours_before?: number | null
          signature_style?: string | null
          state?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          values_in_partner?: string | null
          verified_at?: string | null
        }
        Update: {
          avatar_urls?: string[] | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email_reminders_enabled?: boolean | null
          favorite_brands?: string[] | null
          first_name?: string | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          is_security_verified?: boolean | null
          is_visible?: boolean | null
          job_title?: string | null
          last_name?: string | null
          last_scanned_at?: string | null
          marketing_emails_enabled?: boolean | null
          onboarding_completed?: boolean | null
          profile_completed_at?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referral_notifications_enabled?: boolean | null
          referred_by?: string | null
          reminder_hours_before?: number | null
          signature_style?: string | null
          state?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          values_in_partner?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string
          reward_claimed: boolean | null
          reward_claimed_at: string | null
          reward_type: string | null
          status: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id: string
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          reward_type?: string | null
          status?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          reward_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_approved: boolean
          is_featured: boolean
          name: string
          quote: string
          rating: number | null
          role: string | null
          source: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_featured?: boolean
          name: string
          quote: string
          rating?: number | null
          role?: string | null
          source?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_featured?: boolean
          name?: string
          quote?: string
          rating?: number | null
          role?: string | null
          source?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string | null
          device_name: string | null
          device_type: string | null
          expires_at: string
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active_at: string | null
          os: string | null
          remember_me: boolean | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          os?: string | null
          remember_me?: boolean | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          os?: string | null
          remember_me?: boolean | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_reading_time: { Args: { _content: string }; Returns: number }
      can_reveal_match: { Args: { _user_id: string }; Returns: boolean }
      check_admin_mfa_verified: { Args: { _user_id: string }; Returns: boolean }
      check_admin_rate_limit: {
        Args: {
          _admin_id: string
          _endpoint: string
          _max_requests?: number
          _window_minutes?: number
        }
        Returns: {
          allowed: boolean
          remaining_requests: number
          reset_at: string
        }[]
      }
      check_api_rate_limit: {
        Args: {
          _endpoint: string
          _ip_address: string
          _max_requests?: number
          _window_minutes?: number
        }
        Returns: {
          allowed: boolean
          remaining_requests: number
          reset_at: string
        }[]
      }
      check_oauth_rate_limit: {
        Args: { _ip_address: string }
        Returns: {
          allowed: boolean
          remaining_attempts: number
          requires_captcha: boolean
          reset_at: string
        }[]
      }
      cleanup_expired_cache: { Args: never; Returns: number }
      cleanup_expired_mfa_sessions: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: number }
      cleanup_old_api_rate_limits: { Args: never; Returns: number }
      cleanup_old_leads: { Args: never; Returns: number }
      cleanup_old_oauth_rate_limits: { Args: never; Returns: number }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      create_user_session: {
        Args: {
          _browser: string
          _device_name: string
          _device_type: string
          _ip_address: string
          _os: string
          _remember_me?: boolean
          _session_token: string
          _user_agent: string
          _user_id: string
        }
        Returns: string
      }
      decrement_rsvp_count: { Args: { event_id: string }; Returns: undefined }
      event_has_available_spots: {
        Args: { p_event_id: string }
        Returns: boolean
      }
      get_active_member_count: { Args: never; Returns: number }
      get_application_contact_safe: {
        Args: { _application_id: string }
        Returns: {
          email: string
          instagram_linkedin: string
        }[]
      }
      get_application_safe: {
        Args: { _application_id: string }
        Returns: {
          admin_notes: string
          favorite_brands: string[]
          id: string
          industry: string
          interests: string[]
          job_title: string
          reviewed_at: string
          status: Database["public"]["Enums"]["application_status"]
          style_description: string
          submitted_at: string
          user_id: string
          values_in_partner: string
        }[]
      }
      get_available_reveals: { Args: { _user_id: string }; Returns: number }
      get_cached_data: { Args: { _cache_key: string }; Returns: Json }
      get_connected_profile_limited: {
        Args: { _profile_id: string }
        Returns: {
          avatar_urls: string[]
          city: string
          first_name: string
          id: string
          industry: string
          job_title: string
        }[]
      }
      get_dating_profile_sensitive_data: {
        Args: { _dating_profile_id: string }
        Returns: {
          facebook_url: string
          instagram_url: string
          linkedin_url: string
          phone_number: string
          twitter_url: string
        }[]
      }
      get_matched_profile_safe: {
        Args: { _dating_profile_id: string }
        Returns: {
          age: number
          attachment_style: string
          bio: string
          core_values: string
          display_name: string
          future_goals: string
          gender: string
          id: string
          introvert_extrovert: string
          location: string
          love_language: string
          occupation: string
          photo_url: string
        }[]
      }
      get_membership_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["membership_tier"]
      }
      get_next_waitlist_position: {
        Args: { p_event_id: string }
        Returns: number
      }
      get_upcoming_events_count: { Args: never; Returns: number }
      has_active_membership: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_admin_rate_limit: {
        Args: { _admin_id: string; _endpoint: string }
        Returns: undefined
      }
      increment_api_rate_limit: {
        Args: { _endpoint: string; _ip_address: string }
        Returns: undefined
      }
      increment_oauth_attempt: {
        Args: { _ip_address: string; _is_failure?: boolean }
        Returns: undefined
      }
      increment_post_view_count: {
        Args: { _post_id: string }
        Returns: undefined
      }
      increment_rsvp_count: { Args: { event_id: string }; Returns: undefined }
      is_connected_with: {
        Args: { _other_user_id: string; _user_id: string }
        Returns: boolean
      }
      is_matched_with: {
        Args: { _other_dating_profile_id: string; _user_id: string }
        Returns: boolean
      }
      log_admin_access: {
        Args: {
          _action_type: string
          _details?: Json
          _resource_id?: string
          _resource_type: string
        }
        Returns: undefined
      }
      revoke_user_session: { Args: { _session_id: string }; Returns: boolean }
      save_dating_profile_sensitive_data: {
        Args: {
          _dating_profile_id: string
          _facebook_url?: string
          _instagram_url?: string
          _linkedin_url?: string
          _phone_number?: string
          _twitter_url?: string
        }
        Returns: boolean
      }
      set_cached_data: {
        Args: { _cache_key: string; _data: Json; _ttl_seconds?: number }
        Returns: undefined
      }
      update_session_activity: {
        Args: { _session_token: string }
        Returns: undefined
      }
      use_reveal_credit: {
        Args: { _match_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      application_status: "pending" | "approved" | "rejected"
      business_status: "pending" | "approved" | "featured" | "rejected"
      connection_status: "pending" | "accepted" | "declined"
      lead_status: "new" | "contacted" | "converted" | "dismissed"
      membership_status: "pending" | "active" | "cancelled" | "expired"
      membership_tier: "patron" | "fellow" | "founder"
      security_recommendation: "approve" | "investigate" | "suspend" | "remove"
      security_scan_type: "automatic" | "manual" | "periodic"
      security_severity: "low" | "medium" | "high" | "critical"
      security_status:
        | "pending"
        | "clean"
        | "flagged"
        | "under_review"
        | "cleared"
        | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member"],
      application_status: ["pending", "approved", "rejected"],
      business_status: ["pending", "approved", "featured", "rejected"],
      connection_status: ["pending", "accepted", "declined"],
      lead_status: ["new", "contacted", "converted", "dismissed"],
      membership_status: ["pending", "active", "cancelled", "expired"],
      membership_tier: ["patron", "fellow", "founder"],
      security_recommendation: ["approve", "investigate", "suspend", "remove"],
      security_scan_type: ["automatic", "manual", "periodic"],
      security_severity: ["low", "medium", "high", "critical"],
      security_status: [
        "pending",
        "clean",
        "flagged",
        "under_review",
        "cleared",
        "suspended",
      ],
    },
  },
} as const
