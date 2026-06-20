import apiClient from './client';
import { Banner } from '../types';

export const cmsApi = {
  banners: (type = 'slider') =>
    apiClient.get<{ data: Banner[] }>('/cms/banners', { params: { type } }),

  flashSales: () => apiClient.get('/cms/flash-sales'),

  settings: () => apiClient.get<{ data: Record<string, string> }>('/cms/settings'),

  faqs: (category?: string) =>
    apiClient.get('/cms/faqs', { params: { category } }),

  page: (slug: string) =>
    apiClient.get<{ data: { title: string; content: string } }>(`/cms/pages/${slug}`),
};
