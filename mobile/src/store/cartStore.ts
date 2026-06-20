import { create } from 'zustand';
import { Cart } from '../types';
import { cartApi } from '../api/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number, variantId?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await cartApi.get();
      set({ cart: res.data.data });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity, variantId) => {
    const res = await cartApi.add(productId, quantity, variantId);
    set({ cart: res.data.data });
  },

  updateItem: async (itemId, quantity) => {
    const res = await cartApi.update(itemId, quantity);
    set({ cart: res.data.data });
  },

  removeItem: async (itemId) => {
    const res = await cartApi.remove(itemId);
    set({ cart: res.data.data });
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ cart: null });
  },
}));
