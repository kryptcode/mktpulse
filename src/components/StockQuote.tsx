// src/components/StockQuote.tsx
'use client';

import React from 'react';
import { useGetQuoteQuery } from '@/lib/api/finnhubApi';
// import { useUIStore } from '@/stores/uiStore'; // We only need this to get the list of tickers to map over in the parent

interface StockQuoteProps {
  ticker: string; // Pass the ticker symbol as a prop
}

const StockQuote: React.FC<StockQuoteProps> = ({ ticker }) => {
  const { data: quote, isLoading, isError, error } = useGetQuoteQuery(ticker);

  console.log(quote)

  if (isLoading) {
    return <QuoteCard ticker={ticker} status="Loading..." />;
  }

  if (isError || !quote || typeof quote.c === 'undefined') { // Check if 'c' (current price) exists
    console.error(`Error fetching quote for ${ticker}:`, error, quote);
    return <QuoteCard ticker={ticker} status="Error fetching data" error />;
  }

  const currentPrice = quote.c ?? 0; // Current price
  const change = quote.d ?? 0; // Change
  const percentChange = quote.dp ?? 0; // Percent change
  const openPrice = quote.o ?? 0; // Open price
  const highPrice = quote.h ?? 0; // High price
  const lowPrice = quote.l ?? 0; // Low price
  const prevClose = quote.pc ?? 0; // Previous close

  const isPositive = change >= 0;

  return (
    <QuoteCard ticker={ticker}>
      <div className="text-2xl lg:text-3xl font-bold mb-2">{currentPrice.toFixed(2)}</div>
      <div className={`text-lg font-medium mb-3 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
        <span>Open:</span> <span className="text-right">{openPrice.toFixed(2)}</span>
        <span>High:</span> <span className="text-right">{highPrice.toFixed(2)}</span>
        <span>Low:</span> <span className="text-right">{lowPrice.toFixed(2)}</span>
        <span>Prev Close:</span> <span className="text-right">{prevClose.toFixed(2)}</span>
      </div>
    </QuoteCard>
  );
};

// Simple wrapper card for styling
const QuoteCard: React.FC<{ ticker: string; status?: string; error?: boolean; children?: React.ReactNode }> = ({ ticker, status, error, children }) => (
  <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 ${error ? 'border border-red-500' : ''}`}>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{ticker}</h3>
    {status ? (
      <div className={`text-center py-4 ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{status}</div>
    ) : (
      children
    )}
  </div>
);

export default StockQuote