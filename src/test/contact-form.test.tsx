import { describe, it, expect, vi } from 'vitest';
import { submitContactForm } from '@/services/contactService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Contact Form Service', () => {
  it('should submit contact form successfully', async () => {
    const mockSupabase = await import('@/integrations/supabase/client');
    const mockInvoke = vi.mocked(mockSupabase.supabase.functions.invoke);
    
    mockInvoke.mockResolvedValue({
      data: { success: true, message: 'Message sent successfully' },
      error: null,
    });

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Message',
      message: 'This is a test message',
    };

    const result = await submitContactForm(formData);

    expect(mockInvoke).toHaveBeenCalledWith('send-contact-form', {
      body: formData,
    });
    expect(result.success).toBe(true);
    expect(result.message).toBe('Message sent successfully');
  });

  it('should handle errors from Supabase', async () => {
    const mockSupabase = await import('@/integrations/supabase/client');
    const mockInvoke = vi.mocked(mockSupabase.supabase.functions.invoke);
    
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Function not found' },
    });

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Message',
      message: 'This is a test message',
    };

    const result = await submitContactForm(formData);

    expect(result.error).toBe('Function not found');
  });

  it('should handle network errors', async () => {
    const mockSupabase = await import('@/integrations/supabase/client');
    const mockInvoke = vi.mocked(mockSupabase.supabase.functions.invoke);
    
    mockInvoke.mockRejectedValue(new Error('Network error'));

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Message',
      message: 'This is a test message',
    };

    const result = await submitContactForm(formData);

    expect(result.error).toBe('Network error. Please check your connection and try again.');
  });
});