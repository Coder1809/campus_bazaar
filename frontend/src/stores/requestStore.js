import { useState, useEffect } from 'react';
import api from '../lib/axios';

let reqState = {
  myRequests: [],
  receivedRequests: [],
  activeRequests: [],
  claimQueue: [],
  isLoading: false,
};
let reqListeners = [];

const notifyReq = () => {
  reqListeners.forEach((l) => l({ ...reqState }));
};

export const useRequestStore = (selector) => {
  const [state, setState] = useState({ ...reqState });

  useEffect(() => {
    const listener = (val) => setState(val);
    reqListeners.push(listener);
    return () => {
      reqListeners = reqListeners.filter((l) => l !== listener);
    };
  }, []);

  const store = {
    ...state,
    fetchMyRequests: async () => {
      reqState = { ...reqState, isLoading: true };
      notifyReq();
      try {
        const response = await api.get('/requests/my-requests');
        const data = response.data.data;
        reqState = { ...reqState, myRequests: data.requests || data, isLoading: false };
      } catch (error) {
        reqState = { ...reqState, isLoading: false };
        notifyReq();
        throw error;
      }
      notifyReq();
    },
    fetchReceivedRequests: async () => {
      reqState = { ...reqState, isLoading: true };
      notifyReq();
      try {
        const response = await api.get('/requests/received');
        const data = response.data.data;
        reqState = { ...reqState, receivedRequests: data.requests || data, isLoading: false };
      } catch (error) {
        reqState = { ...reqState, isLoading: false };
        notifyReq();
        throw error;
      }
      notifyReq();
    },
    fetchActiveRequests: async () => {
      reqState = { ...reqState, isLoading: true };
      notifyReq();
      try {
        const response = await api.get('/requests/active');
        const data = response.data.data;
        reqState = { ...reqState, activeRequests: data.requests || data, isLoading: false };
      } catch (error) {
        reqState = { ...reqState, isLoading: false };
        notifyReq();
        throw error;
      }
      notifyReq();
    },
    createRequest: async (data) => {
      let response;
      if (data instanceof FormData) {
        response = await api.post('/requests', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/requests', data);
      }
      reqState = { ...reqState, myRequests: [...reqState.myRequests, response.data.data] };
      notifyReq();
      return response.data;
    },
    acceptRequest: async (id) => {
      const response = await api.post(`/requests/${id}/accept`);
      reqState = {
        ...reqState,
        receivedRequests: reqState.receivedRequests.map(req => 
          req._id === id ? { ...req, status: 'ACCEPTED' } : req
        )
      };
      notifyReq();
      return response.data;
    },
    rejectRequest: async (id) => {
      const response = await api.post(`/requests/${id}/reject`);
      reqState = {
        ...reqState,
        receivedRequests: reqState.receivedRequests.map(req => 
          req._id === id ? { ...req, status: 'REJECTED' } : req
        )
      };
      notifyReq();
      return response.data;
    },
    cancelRequest: async (id) => {
      const response = await api.post(`/requests/${id}/cancel`);
      reqState = {
        ...reqState,
        myRequests: reqState.myRequests.map(req => 
          req._id === id ? { ...req, status: 'CANCELLED' } : req
        )
      };
      notifyReq();
      return response.data;
    },
    instantClaim: async (itemId) => {
      const response = await api.post(`/requests/instant-claim/${itemId}`);
      return response.data;
    },
    getClaimQueue: async (itemId) => {
      const response = await api.get(`/requests/claim-queue/${itemId}`);
      const data = response.data.data;
      reqState = { ...reqState, claimQueue: data.claims || data };
      notifyReq();
      return data.claims || data;
    },
    updateClaimStatus: async (claimId, status) => {
      const response = await api.patch(`/requests/claims/${claimId}/status`, { status });
      reqState = {
        ...reqState,
        claimQueue: reqState.claimQueue.map(claim =>
          claim._id === claimId ? { ...claim, status } : claim
        )
      };
      notifyReq();
      return response.data;
    },
    createCounterOffer: async (requestId, offer) => {
      const response = await api.post(`/requests/${requestId}/counter-offer`, offer);
      reqState = {
        ...reqState,
        receivedRequests: reqState.receivedRequests.map(req =>
          req._id === requestId ? { ...req, counterOffer: response.data.data.counterOffer } : req
        )
      };
      notifyReq();
      return response.data;
    },
    respondToCounterOffer: async (requestId, accept) => {
      const response = await api.post(`/requests/${requestId}/counter-offer/respond`, { accept });
      const status = accept ? 'ACCEPTED' : 'REJECTED';
      reqState = {
        ...reqState,
        myRequests: reqState.myRequests.map(req =>
          req._id === requestId ? { 
            ...req, 
            counterOffer: { ...req.counterOffer, status },
            status: accept ? 'ACCEPTED' : req.status
          } : req
        )
      };
      notifyReq();
      return response.data;
    },
    proposePickupDetails: async (requestId, details) => {
      const response = await api.post(`/requests/${requestId}/pickup`, details);
      const updateRequest = (req) => 
        req._id === requestId ? { ...req, pickupDetails: response.data.data.pickupDetails } : req;
      
      reqState = {
        ...reqState,
        receivedRequests: reqState.receivedRequests.map(updateRequest),
        myRequests: reqState.myRequests.map(updateRequest)
      };
      notifyReq();
      return response.data;
    },
    confirmPickupDetails: async (requestId) => {
      const response = await api.post(`/requests/${requestId}/pickup/confirm`);
      const updateRequest = (req) =>
        req._id === requestId ? { 
          ...req, 
          pickupDetails: { ...req.pickupDetails, status: 'CONFIRMED' } 
        } : req;

      reqState = {
        ...reqState,
        receivedRequests: reqState.receivedRequests.map(updateRequest),
        myRequests: reqState.myRequests.map(updateRequest)
      };
      notifyReq();
      return response.data;
    }
  };

  return typeof selector === 'function' ? selector(store) : store;
};

export default useRequestStore;
