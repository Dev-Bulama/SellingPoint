import apiClient from './client';
import { Order, PaginatedResponse } from '../types';

export const ordersApi = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params: { page } }),

  show: (orderNumber: string) =>
    apiClient.get<{ data: Order }>(`/orders/${orderNumber}`),

  checkout: (data: {
    address_id: number;
    payment_method: 'paystack' | 'cash_on_delivery';
    coupon_code?: string;
    notes?: string;
  }) => apiClient.post<{ data: Order; message: string }>('/orders/checkout', data),

  cancel: (orderNumber: string, reason?: string) =>
    apiClient.post(`/orders/${orderNumber}/cancel`, { reason }),

  validateCoupon: (code: string, subtotal: number) =>
    apiClient.post<{ message: string; coupon: any; discount: number }>(
      '/orders/validate-coupon',
      { code, subtotal }
    ),
};
