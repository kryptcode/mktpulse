
'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';

// Define the available time ranges matching the type in uiStore
const RANGES = ['1D', '5D', '1M', '6M', '1Y', '5Y', 'MAX'] as const;
// type TimeRange = typeof RANGES[number];

const TimeRangeSelector: React.FC = () => {
  const { currentTimeRange, setTimeRange } = useUIStore();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-4">
        Time Range
      </label>
      <div className="flex flex-wrap gap-2">
        {RANGES.map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors
              ${
                currentTimeRange === range
                  ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector;