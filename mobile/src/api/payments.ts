import apiClient from './client';

export const paymentsApi = {
  initialize: (orderNumber: string) =>
    apiClient.post<{
      reference: string;
      access_code: string;
      authorization_url: string;
      amount: number;
    }>('/payments/initialize', { order_number: orderNumber }),

  verify: (reference: string) =>
    apiClient.post<{ status: string; message: string }>('/payments/verify', { reference }),
};
