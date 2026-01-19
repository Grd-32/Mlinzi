// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Kenya format)
export const isValidPhoneNumber = (phone: string): boolean => {
  // Accept formats like: +254712345678, 0712345678, 254712345678
  const phoneRegex = /^(\+?254|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Clean phone number to standard format
export const normalizePhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('254')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1);
  }
  return '+254' + cleaned;
};

// Validate password strength
export const isStrongPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Get password strength indicator
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  if (password.length < 10) return 'medium';
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
    return 'strong';
  }
  return 'medium';
};

// Validate name
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
