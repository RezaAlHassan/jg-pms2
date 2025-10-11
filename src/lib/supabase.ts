import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on lowercase schema
export interface Department {
  department_id: number;
  department_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  role_id: number;
  role_name: string;
  description?: string;
  max_budget_limit: number;
  can_approve: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  department_id: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  user_id: number;
  role_id: number;
  assigned_at?: string;
  assigned_by?: number;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_info?: any; // JSONB
  certifications?: string;
  contract_terms?: string;
  onboarding_date: string;
  status: 'Approved' | 'Pending' | 'Inactive' | 'Suspended';
  created_at?: string;
  updated_at?: string;
}

export interface SupplierRating {
  rating_id: number;
  supplier_id: number;
  rating_date: string;
  timeliness_score: number;
  quality_score: number;
  responsiveness_score: number;
  overall_score?: number;
  rated_by: number;
  comments?: string;
  created_at?: string;
}

export interface Budget {
  budget_id: number;
  department_id: number;
  fiscal_year: number;
  total_amount: number;
  remaining_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseRequest {
  request_id: number;
  requester_id: number;
  request_date?: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'In Progress' | 'Completed';
  funding_source?: string;
  budget_id: number; // Made mandatory
  department_id: number; // Made mandatory
  description?: string;
  justification?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Catalog {
  catalog_id: number;
  supplier_id: number;
  department_id: number;
  catalog_name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Invitation {
  invitation_id: number;
  email: string;
  first_name: string;
  last_name: string;
  department_id: number;
  role_ids: number[];
  invitation_token: string;
  invited_by: number;
  status: 'Pending' | 'Accepted' | 'Expired' | 'Cancelled';
  expires_at: string;
  created_at?: string;
  accepted_at?: string;
}
