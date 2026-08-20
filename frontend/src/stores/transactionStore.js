import { useState, useEffect } from 'react';
import api from '../lib/axios';

let txState = {
  transactions: [],
  currentTransaction: null,
  isLoading: false,
};
let txListeners = [];

const notifyTx = () => {
  txListeners.forEach((l) => l({ ...txState }));
};

export const useTransactionStore = (selector) => {
  const [state, setState] = useState({ ...txState });

  useEffect(() => {
    const listener = (val) => setState(val);
    txListeners.push(listener);
    return () => {
      txListeners = txListeners.filter((l) => l !== listener);
    };
  }, []);

  const store = {
    ...state,
    fetchTransactions: async () => {
      txState = { ...txState, isLoading: true };
      notifyTx();
      try {
        const response = await api.get('/transactions');
        const data = response.data.data;
        txState = { ...txState, transactions: data.transactions || data, isLoading: false };
      } catch (error) {
        txState = { ...txState, isLoading: false };
        notifyTx();
        throw error;
      }
      notifyTx();
    },
    fetchTransaction: async (id) => {
      txState = { ...txState, isLoading: true };
      notifyTx();
      try {
        const response = await api.get(`/transactions/${id}`);
        txState = { ...txState, currentTransaction: response.data.data, isLoading: false };
        notifyTx();
        return response.data.data;
      } catch (error) {
        txState = { ...txState, isLoading: false };
        notifyTx();
        throw error;
      }
    },
    proposeAgreement: async (id, agreementData) => {
      const response = await api.post(`/transactions/${id}/propose-agreement`, agreementData);
      txState = { ...txState, currentTransaction: response.data.data };
      notifyTx();
      return response.data;
    },
    confirmAgreement: async (id) => {
      const response = await api.post(`/transactions/${id}/confirm-agreement`);
      txState = { ...txState, currentTransaction: response.data.data };
      notifyTx();
      return response.data;
    },
    markReturnPending: async (id) => {
      const response = await api.post(`/transactions/${id}/mark-returned`);
      txState = { ...txState, currentTransaction: response.data.data };
      notifyTx();
      return response.data;
    },
    confirmReturn: async (id) => {
      const response = await api.post(`/transactions/${id}/confirm-return`);
      txState = { ...txState, currentTransaction: response.data.data };
      notifyTx();
      return response.data;
    },
    raiseDispute: async (id, reason) => {
      const response = await api.post(`/transactions/${id}/dispute`, { reason });
      txState = { ...txState, currentTransaction: response.data.data };
      notifyTx();
      return response.data;
    },
    updateCurrentTransaction: (data) => {
      txState = { ...txState, currentTransaction: { ...txState.currentTransaction, ...data } };
      notifyTx();
    }
  };

  return typeof selector === 'function' ? selector(store) : store;
};

export default useTransactionStore;
