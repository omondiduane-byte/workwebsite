// src/supabase/inquiryService.ts
import { supabase } from './supabaseClient';

export const inquiryService = {
  // Function to fetch all inquiries
  async getAllInquiries() {
    const { data, error } = await supabase.from('inquiries').select('*');
    if (error) throw error;
    return data;
  },

  // Function to save a new record
  async createInquiry(newInquiry: Record<string, unknown>) {
    const { data, error } = await supabase.from('inquiries').insert([newInquiry]);
    if (error) throw error;
    return data;
  }
};
