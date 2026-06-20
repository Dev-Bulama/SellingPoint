import apiClient from './client';
import { Cart } from '../types';

export const cartApi = {
  get: () => apiClient.get<{ data: Cart }>('/cart'),

  add: (productId: number, quantity: number, variantId?: number) =>
    apiClient.post<{ data: Cart; message: string }>('/cart/add', {
      product_id: productId,
      quantity,
      product_variant_id: variantId,
    }),

  update: (itemId: number, quantity: number) =>
    apiClient.put<{ data: Cart; message: string }>(`/cart/items/${itemId}`, { quantity }),

  remove: (itemId: number) =>
    apiClient.delete<{ data: Cart; message: string }>(`/cart/items/${itemId}`),

  clear: () => apiClient.delete('/cart/clear'),
};
