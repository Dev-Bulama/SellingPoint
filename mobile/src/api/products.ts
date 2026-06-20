import apiClient from './client';
import { Product, Category, Brand, PaginatedResponse, Review } from '../types';

export interface ProductFilters {
  category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  search?: string;
  sort?: 'latest' | 'price_asc' | 'price_desc' | 'popular' | 'rating' | 'discount';
  in_stock?: boolean;
  page?: number;
  per_page?: number;
}

export const productsApi = {
  list: (filters: ProductFilters = {}) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params: filters }),

  show: (slug: string) => apiClient.get<{ data: Product }>(`/products/${slug}`),

  featured: () => apiClient.get<{ data: Product[] }>('/products/featured'),
  newArrivals: () => apiClient.get<{ data: Product[] }>('/products/new-arrivals'),
  bestSellers: () => apiClient.get<{ data: Product[] }>('/products/best-sellers'),
  flashSales: () => apiClient.get<{ data: Product[] }>('/products/flash-sales'),

  related: (slug: string) => apiClient.get<{ data: Product[] }>(`/products/${slug}/related`),

  reviews: (slug: string, page = 1) =>
    apiClient.get<{ data: Review[]; summary: { average_rating: number; review_count: number } }>(
      `/products/${slug}/reviews`,
      { params: { page } }
    ),

  recentlyViewed: () => apiClient.get<{ data: Product[] }>('/recently-viewed'),

  categories: () => apiClient.get<{ data: Category[] }>('/categories'),

  brands: () => apiClient.get<{ data: Brand[] }>('/brands'),
};
