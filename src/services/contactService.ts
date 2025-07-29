import { supabase } from "@/integrations/supabase/client";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export const submitContactForm = async (data: ContactFormData): Promise<ContactFormResponse> => {
  try {
    const { data: response, error } = await supabase.functions.invoke('send-contact-form', {
      body: data,
    });

    if (error) {
      console.error('Contact form submission error:', error);
      return {
        error: error.message || 'Failed to send message. Please try again.'
      };
    }

    return response;
  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      error: 'Network error. Please check your connection and try again.'
    };
  }
};