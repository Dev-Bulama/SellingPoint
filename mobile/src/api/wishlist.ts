import apiClient from './client';
import { Product } from '../types';

export const wishlistApi = {
  list: () => apiClient.get<{ data: Product[] }>('/wishlist'),
  toggle: (productId: number) =>
    apiClient.post<{ message: string; in_wishlist: boolean }>('/wishlist/toggle', { product_id: productId }),
  check: (productId: number) =>
    apiClient.get<{ in_wishlist: boolean }>(`/wishlist/check/${productId}`),
};
