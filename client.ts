
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://lqhyvnxbokjcuyccuxdx.supabase.co';
// Note: This key should be stored in environment variables, but is placed here for this demo.
// Replace with your actual Supabase anon public key.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxaHl2bnhib2tqY3V5Y2N1eGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTMxOTIsImV4cCI6MjA3NjEyOTE5Mn0.2BsKiXd9Ld-DRSPcODQkqLhL6lcQEZcdEa97pZjjTK0'; 

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);