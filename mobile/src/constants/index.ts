// API_BASE_URL is now managed in src/config/api.ts — change it there.
// Emulator default: http://10.0.2.2:8000/api/v1
export const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';
export const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxx';
export const ONESIGNAL_APP_ID = 'your-onesignal-app-id';

export const COLORS = {
  primary: '#FF6B00',
  primaryDark: '#E55A00',
  primaryLight: '#FF8C42',
  secondary: '#1A1A2E',
  accent: '#E63946',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  grayLight: '#F5F5F5',
  grayMedium: '#E0E0E0',
  grayDark: '#616161',
  background: '#F8F8F8',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#757575',
  textMuted: '#BDBDBD',
  border: '#EEEEEE',
  divider: '#F0F0F0',
  placeholder: '#BDBDBD',
  overlay: 'rgba(0,0,0,0.5)',
  cardShadow: 'rgba(0,0,0,0.08)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  screenPadding: 16,
  borderRadius: 12,
  borderRadiusSm: 8,
  borderRadiusLg: 20,
  cardElevation: 4,
};

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: '#F39C12' },
  confirmed: { label: 'Confirmed', color: '#3498DB' },
  processing: { label: 'Processing', color: '#9B59B6' },
  shipped: { label: 'Shipped', color: '#1ABC9C' },
  delivered: { label: 'Delivered', color: '#2ECC71' },
  cancelled: { label: 'Cancelled', color: '#E74C3C' },
  refunded: { label: 'Refunded', color: '#95A5A6' },
} as const;

export const PAYMENT_STATUSES = {
  unpaid: { label: 'Unpaid', color: '#F39C12' },
  paid: { label: 'Paid', color: '#2ECC71' },
  failed: { label: 'Failed', color: '#E74C3C' },
  refunded: { label: 'Refunded', color: '#95A5A6' },
} as const;
