'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';

const SelectedTickers: React.FC = () => {
  const { selectedTickers, removeTicker } = useUIStore();

  if (selectedTickers.length === 0) {
    return <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">No tickers selected. Use search to add some.</div>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Selected:</span>
      {selectedTickers.map((ticker) => (
        <span
          key={ticker}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
        >
          {ticker}
          <button
            onClick={() => removeTicker(ticker)}
            className="flex-shrink-0 ml-1.5 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-500 hover:bg-indigo-200 hover:text-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-800 dark:hover:text-indigo-200 focus:outline-none focus:bg-indigo-500 focus:text-white"
            aria-label={`Remove ${ticker}`}
          >
            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
              <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
};

export default SelectedTickers;