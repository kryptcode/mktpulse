/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useSymbolSearchQuery } from '@/lib/api/finnhubApi';
import { useDebounce } from '@/hooks/useDebounce';

const TickerSearch: React.FC = () => {
  const { searchTerm, setSearchTerm, addTicker } = useUIStore();
  const [showResults, setShowResults] = useState(false);

  // Debounce the search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

  const { data: searchResults, isLoading, isFetching } = useSymbolSearchQuery(
    debouncedSearchTerm,
    {
      skip: !debouncedSearchTerm || debouncedSearchTerm.length < 1, // Skip query if term is empty
    }
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setShowResults(true);
  };

  const handleSelectTicker = (symbol: string) => {
    addTicker(symbol);
    setSearchTerm(''); // Clear search term after selection
    setShowResults(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.search-container')) return; // Ignore clicks inside the container
      setShowResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="relative search-container">
      <label htmlFor="ticker-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Search & Add Ticker
      </label>
      <input
        id="ticker-search"
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => searchTerm && setShowResults(true)} // Show results on focus if there's a term
        placeholder="e.g., AAPL, MSFT"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      {(isLoading || isFetching) && searchTerm && (
         <div className="absolute right-2 top-9 text-gray-400">
           {/* Basic spinner or loading text */}
           Loading...
         </div>
      )}

      {showResults && debouncedSearchTerm && searchResults?.result?.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.result
             .filter((item: any) => item.type === 'Common Stock' || item.type === 'ETF') // Filter for relevant types
             .slice(0, 10) // Limit results shown
             .map((item: any) => (
            <li
              key={item.symbol}
              onClick={() => handleSelectTicker(item.symbol)}
              className="px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-200"
            >
              <span className="font-semibold">{item.symbol}</span> - {item.description}
            </li>
          ))}
        </ul>
      )}
       {showResults && debouncedSearchTerm && !isFetching && searchResults?.result?.length === 0 && (
         <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-2 text-sm text-gray-500 dark:text-gray-400">
            No results found for &quot;{debouncedSearchTerm}&quot;.
         </div>
       )}
    </div>
  );
};

export default TickerSearch;