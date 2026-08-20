import { useState, useEffect } from 'react';
import api from '../lib/axios';

let itemState = {
  items: [],
  myItems: [],
  currentItem: null,
  isLoading: false,
  filters: {
    category: '',
    mode: '',
    priceMin: '',
    priceMax: '',
    search: ''
  }
};

let itemListeners = [];

const notifyItem = () => {
  itemListeners.forEach((l) => l({ ...itemState }));
};

export const useItemStore = (selector) => {
  const [state, setState] = useState({ ...itemState });

  useEffect(() => {
    const listener = (val) => setState(val);
    itemListeners.push(listener);
    return () => {
      itemListeners = itemListeners.filter((l) => l !== listener);
    };
  }, []);

  const store = {
    ...state,
    setFilters: (filters) => {
      itemState = { ...itemState, filters: { ...itemState.filters, ...filters } };
      notifyItem();
    },
    fetchItems: async () => {
      itemState = { ...itemState, isLoading: true };
      notifyItem();
      try {
        const { filters } = itemState;
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.mode) params.append('mode', filters.mode);
        if (filters.priceMin) params.append('priceMin', filters.priceMin);
        if (filters.priceMax) params.append('priceMax', filters.priceMax);
        if (filters.search) params.append('search', filters.search);
        
        const response = await api.get(`/items?${params.toString()}`);
        const data = response.data.data;
        itemState = { ...itemState, items: data.items || data || [], isLoading: false };
      } catch {
        itemState = { ...itemState, items: [], isLoading: false };
      }
      notifyItem();
    },
    fetchMyItems: async () => {
      itemState = { ...itemState, isLoading: true };
      notifyItem();
      try {
        const response = await api.get('/items/my-items');
        const data = response.data.data;
        itemState = { ...itemState, myItems: data.items || data || [], isLoading: false };
      } catch {
        itemState = { ...itemState, myItems: [], isLoading: false };
      }
      notifyItem();
    },
    fetchItem: async (id) => {
      itemState = { ...itemState, isLoading: true };
      notifyItem();
      try {
        const response = await api.get(`/items/${id}`);
        itemState = { ...itemState, currentItem: response.data.data, isLoading: false };
        notifyItem();
        return response.data.data;
      } catch (error) {
        itemState = { ...itemState, isLoading: false };
        notifyItem();
        throw error;
      }
    },
    createItem: async (formData) => {
      const response = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      itemState = { ...itemState, myItems: [...itemState.myItems, response.data.data] };
      notifyItem();
      return response.data;
    },
    updateItem: async (id, data) => {
      const response = await api.patch(`/items/${id}`, data);
      const updated = response.data.data;
      itemState = {
        ...itemState,
        myItems: itemState.myItems.map(item => item._id === id ? updated : item),
        currentItem: itemState.currentItem?._id === id ? updated : itemState.currentItem
      };
      notifyItem();
      return response.data;
    },
    deleteItem: async (id) => {
      await api.delete(`/items/${id}`);
      itemState = { ...itemState, myItems: itemState.myItems.filter(item => item._id !== id) };
      notifyItem();
    },
    toggleAvailability: async (id) => {
      const response = await api.patch(`/items/${id}/availability`);
      const updated = response.data.data;
      itemState = {
        ...itemState,
        myItems: itemState.myItems.map(item => item._id === id ? updated : item)
      };
      notifyItem();
      return response.data;
    }
  };

  return typeof selector === 'function' ? selector(store) : store;
};

export default useItemStore;
