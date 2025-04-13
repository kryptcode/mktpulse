/* eslint-disable @typescript-eslint/no-explicit-any */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// No longer need API_KEY here
// const BASE_URL = 'https://finnhub.io/api/v1'; // OLD
const BASE_URL = '/api/finnhub'; // NEW: Point to our proxy route

// Define a service using a base URL and expected endpoints
export const finnhubApi = createApi({
  reducerPath: 'finnhubApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }), // Updated baseUrl
  endpoints: (builder) => ({
    getQuote: builder.query<any, string>({
      // No need for token here anymore
      query: (symbol) => `/quote?symbol=${symbol.toUpperCase()}`,
      // provideTags can be useful for cache invalidation, e.g., ['Quote', symbol]
      // providesTags: (result, error, symbol) => [{ type: 'Quote', id: symbol }],
    }),

    getStockCandles: builder.query<any, { symbol: string; resolution: string; from: number; to: number }>({
      // No need for token here anymore
      query: ({ symbol, resolution, from, to }) =>
        `/stock/candle?symbol=${symbol.toUpperCase()}&resolution=${resolution}&from=${from}&to=${to}`,
      // providesTags: (result, error, { symbol }) => [{ type: 'Candle', id: symbol }],
    }),

    symbolSearch: builder.query<any, string>({
      // No need for token here anymore
      query: (query) => {
         // No need to check for API key here
         if (!query) return ''; // Still useful to prevent empty queries
         return `/search?q=${query}`;
      },
       // Searches might not need tags unless you want very specific caching
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetQuoteQuery,
  useGetStockCandlesQuery,
  useSymbolSearchQuery,
} = finnhubApi;