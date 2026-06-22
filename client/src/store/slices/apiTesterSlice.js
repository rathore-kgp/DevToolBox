import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';

export const sendProxyRequest = createAsyncThunk(
  'apiTester/send',
  async (requestConfig, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/tools/proxy', requestConfig);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Proxy request failed');
    }
  }
);

// ── NEW ──
export const fetchCollections = createAsyncThunk(
  'apiTester/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/tools/collections');
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Failed to fetch collections');
    }
  }
);

export const saveCollection = createAsyncThunk(
  'apiTester/saveCollection',
  async (collection, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/tools/collections', collection);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Failed to save collection');
    }
  }
);

const apiTesterSlice = createSlice({
  name: 'apiTester',
  initialState: {
    url: 'https://jsonplaceholder.typicode.com/todos/1',
    method: 'GET',
    headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
    body: '',
    response: null,
    isLoading: false,
    error: null,
    collections: [],        // ── NEW ──
    collectionsLoading: false, // ── NEW ──
  },
  reducers: {
    setUrl: (state, { payload }) => { state.url = payload; },
    setMethod: (state, { payload }) => { state.method = payload; },
    setHeaders: (state, { payload }) => { state.headers = payload; },
    setBody: (state, { payload }) => { state.body = payload; },
    clearResponse: (state) => {   // ── NEW ──
      state.response = null;
      state.error = null;
    },
    loadRequest: (state, { payload }) => {
      state.url = payload.url;
      state.method = payload.method;
      state.headers = Object.entries(payload.headers || {})
        .map(([k, v]) => ({ key: k, value: v, enabled: true }));
      state.body = payload.body || '';
    },
  },
  extraReducers: (builder) => {
    // Send proxy request — same as before
    builder
      .addCase(sendProxyRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(sendProxyRequest.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.response = payload;
      })
      .addCase(sendProxyRequest.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        state.response = null; // make sure response is cleared on error
      });

    // Fetch collections ── NEW ──
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.collectionsLoading = true;
      })
      .addCase(fetchCollections.fulfilled, (state, { payload }) => {
        state.collectionsLoading = false;
        state.collections = payload.data || [];
      })
      .addCase(fetchCollections.rejected, (state) => {
        state.collectionsLoading = false;
      });

    // Save collection ── NEW ──
    builder.addCase(saveCollection.fulfilled, (state, { payload }) => {
      state.collections.push(payload.data);
    });
  },
});

export const {
  setUrl, setMethod, setHeaders,
  setBody, clearResponse, loadRequest
} = apiTesterSlice.actions;

export default apiTesterSlice.reducer;

// Selectors
export const selectUrl = (state) => state.apiTester.url;
export const selectMethod = (state) => state.apiTester.method;
export const selectHeaders = (state) => state.apiTester.headers;
export const selectBody = (state) => state.apiTester.body;
export const selectResponse = (state) => state.apiTester.response;
export const selectIsLoading = (state) => state.apiTester.isLoading;
export const selectError = (state) => state.apiTester.error;
export const selectCollections = (state) => state.apiTester.collections;
export const selectCollectionsLoading = (state) => state.apiTester.collectionsLoading;