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
  },
  reducers: {
    setUrl: (state, { payload }) => { state.url = payload; },
    setMethod: (state, { payload }) => { state.method = payload; },
    setHeaders: (state, { payload }) => { state.headers = payload; },
    setBody: (state, { payload }) => { state.body = payload; },
    loadRequest: (state, { payload }) => {
      state.url = payload.url;
      state.method = payload.method;
      state.headers = Object.entries(payload.headers || {}).map(([k, v]) => ({ key: k, value: v, enabled: true }));
      state.body = payload.body || '';
    },
  },
  extraReducers: (builder) => {
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
      });
  },
});

export const { setUrl, setMethod, setHeaders, setBody, loadRequest } = apiTesterSlice.actions;
export default apiTesterSlice.reducer;