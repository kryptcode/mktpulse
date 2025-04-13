/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale for time-based x-axis
  ChartOptions,
  ChartData,
  ChartDataset // Import ChartDataset type
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter
import { useUIStore } from '@/stores/uiStore';
import { subDays, subMonths, subYears, getUnixTime } from 'date-fns';
import TickerDataSeries from './TickerDataSeries'; // Import the child component

// --- Configuration ---
// Set this to true to use mock data for the candle chart and show a warning.
// Set to false to attempt using the live Finnhub API via your proxy.
const USING_MOCK_CANDLE_DATA = true;
// -------------------

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale, // Register TimeScale
  Title,
  Tooltip,
  Legend
);

// Helper to calculate 'from' timestamp based on range
const getFromTimestamp = (range: string): number => {
  const now = new Date();
  switch (range) {
    case '1D': return getUnixTime(subDays(now, 1));
    case '5D': return getUnixTime(subDays(now, 5));
    case '1M': return getUnixTime(subMonths(now, 1));
    case '6M': return getUnixTime(subMonths(now, 6));
    case '1Y': return getUnixTime(subYears(now, 1));
    case '5Y': return getUnixTime(subYears(now, 5));
    case 'MAX': return getUnixTime(subYears(now, 10)); // Example for MAX: 10 years back
    default: return getUnixTime(subYears(now, 1));
  }
};

// Helper to determine Finnhub resolution based on range (still needed for mock data generation)
const getResolution = (range: string): string => {
    if (range === '1D') return '15'; // Affects mock data density
    if (range === '5D') return '60'; // Affects mock data density
    if (['1M', '6M', '1Y'].includes(range)) return 'D'; // Affects mock data density
    return 'W'; // Affects mock data density
};

const StockChart: React.FC = () => {
  const { selectedTickers, currentTimeRange } = useUIStore();

  // Calculate 'from' and 'to' timestamps and resolution
  const toTimestamp = getUnixTime(new Date());
  const fromTimestamp = getFromTimestamp(currentTimeRange);
  const resolution = getResolution(currentTimeRange);

  // State to hold datasets received from child components
  const [tickerDatasets, setTickerDatasets] = useState<Record<string, ChartDataset<'line', { x: number; y: number }[]> | null>>({});

  // Callback for child components to update the state
  // Use useCallback to prevent unnecessary re-renders of children
  const handleDatasetReady = useCallback((ticker: string, dataset: ChartDataset<'line', { x: number; y: number }[]> | null) => {
    setTickerDatasets(prevDatasets => {
      // Only update if the dataset reference actually changes
      if (prevDatasets[ticker] !== dataset) {
          return {
             ...prevDatasets,
             [ticker]: dataset,
          };
      }
      return prevDatasets; // No change needed
    });
  }, []); // Empty dependency array: this function reference is stable

  // Effect to clean up datasets when tickers are removed from selection
   useEffect(() => {
       const currentTickerSet = new Set(selectedTickers);
       setTickerDatasets(prevDatasets => {
           const nextDatasets: Record<string, ChartDataset<'line', { x: number; y: number }[]> | null> = {};
           let changed = false;
           // Rebuild the dataset object only with currently selected tickers
           for (const ticker of selectedTickers) {
              if (prevDatasets[ticker]) {
                 nextDatasets[ticker] = prevDatasets[ticker];
              }
           }
           // Check if the keys are different (more robust than just length check)
           if (Object.keys(nextDatasets).length !== Object.keys(prevDatasets).length ||
               Object.keys(nextDatasets).some(key => !prevDatasets[key])) {
               changed = true;
           }

           return changed ? nextDatasets : prevDatasets;
       });
   }, [selectedTickers]); // Run only when the list of selected tickers changes


  // Prepare final chart data structure using collected datasets
  const chartData = useMemo(() => {
    // Filter out null/empty datasets and maintain the order of selectedTickers
    const finalDatasets = selectedTickers
        .map(ticker => tickerDatasets[ticker]) // Get dataset for each selected ticker
        .filter((ds): ds is ChartDataset<'line', { x: number; y: number }[]> => !!ds && ds.data.length > 0); // Type guard & ensure data exists

    return {
      // labels: [], // Let the time scale handle labels
      datasets: finalDatasets,
    } as ChartData<'line', { x: number; y: number }[]>; // Type assertion

  // Depend on the state holding the datasets and the order array
  }, [tickerDatasets, selectedTickers]);


  // Chart options (memoize as before)
  const options: ChartOptions<'line'> = useMemo(() => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // Disable animation for smoother updates with mock data potentially
      plugins: {
        legend: {
          position: 'top' as const,
           labels: {
             // Consider reducing box width if many tickers
             boxWidth: 20,
             padding: 15,
           }
        },
        title: {
          display: true,
          text: `Stock Prices (${currentTimeRange})${USING_MOCK_CANDLE_DATA ? ' - Simulated Data' : ''}`, // Updated title
          padding: {
             top: 10,
             bottom: 10
           }
        },
         tooltip: {
            mode: 'index', // Show tooltip for all datasets at the same x-index
            intersect: false, // Don't require hovering directly over point
            position: 'nearest',
            callbacks: {
               // Optional: Customize tooltip title/label format if needed
               // title: (tooltipItems) => { ... }
               // label: (tooltipItem) => { ... }
            }
        },
      },
       hover: {
          mode: 'index', // Highlight lines based on x-index
          intersect: false,
       },
      scales: {
        x: {
          type: 'time', // Use time scale
          time: {
            unit: resolution === '15' ? 'minute' : resolution === '60' ? 'hour' : resolution === 'W' ? 'week' : 'day', // Adjust unit based on data density
            tooltipFormat: 'PPpp', // Date and time format for tooltips (e.g., Sep 4, 1986, 8:30 PM) requires date-fns
             displayFormats: { // Control how labels appear on the axis
               minute: 'HH:mm', // Show time for intraday
               hour: 'MMM d HH:mm',
               day: 'MMM d, yyyy',
               week: 'MMM d, yyyy',
               month: 'MMM yyyy',
               quarter: 'QQQ yyyy',
               year: 'yyyy',
             }
          },
          title: {
            display: true,
            text: 'Date',
          },
          grid: {
             color: 'rgba(200, 200, 200, 0.1)', // Lighter grid lines
          }
        },
        y: {
          title: {
            display: true,
            text: 'Price (Simulated USD)', // Indicate simulation in axis too
          },
           grid: {
              color: 'rgba(200, 200, 200, 0.1)', // Lighter grid lines
           },
           // Optional: Improve tick formatting
           ticks: {
                callback: function(value, index, ticks) {
                    // Format as currency if needed, or just use default
                    return typeof value === 'number' ? '$' + value.toFixed(2) : value;
                }
            }
        },
      },
       interaction: { // Enable crosshair-like interaction
          mode: 'index',
          intersect: false,
        },
        elements: {
            point: {
                radius: 0 // Globally hide points unless overridden in dataset
            }
        }
  }), [currentTimeRange, resolution]); // Dependency on time range and resolution for scales/title

  // --- Render Logic ---

  // Handle case where no tickers are selected
  if (selectedTickers.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Please select one or more tickers to display the chart.</div>;
  }

  // Determine loading state (only relevant if NOT using mock data)
  const isLoadingRealData = !USING_MOCK_CANDLE_DATA && selectedTickers.some(ticker =>
      !tickerDatasets[ticker] || tickerDatasets[ticker]?.label?.includes('(Loading...)')
  );


  return (
    // Use flex column to stack warning and chart
    <div className="h-full w-full relative flex flex-col">

      {/* --- MOCK DATA WARNING --- */}
      {USING_MOCK_CANDLE_DATA && (
        <div className="p-3 mb-4 text-center bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-md text-amber-800 dark:text-amber-200 text-sm shadow-sm">
          <strong className="font-medium">⚠️ Simulated Chart Data:</strong> The chart below uses randomly generated mock data for demonstration purposes. Access to real-time/historical candle data via the Finnhub API requires a premium subscription.
        </div>
      )}
      {/* ----------------------- */}


      {/* Container for the chart itself, allowing it to grow */}
      <div className="flex-grow relative min-h-[300px]"> {/* Ensure minimum height */}

        {/* Render the data fetching/generating components (they render null) */}
        {selectedTickers.map((ticker, index) => (
          <TickerDataSeries
            key={ticker} // Crucial for React list reconciliation
            ticker={ticker}
            resolution={resolution}
            from={fromTimestamp}
            to={toTimestamp}
            index={index} // Pass index for color generation
            onDatasetReady={handleDatasetReady} // Pass the stable callback
          />
        ))}

        {/* Optional: Global loading indicator (only show if NOT using mock data and data is actually loading) */}
        {isLoadingRealData && (
           <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-800/60 z-10 rounded-md">
               <p className="text-gray-700 dark:text-gray-300 text-lg font-medium animate-pulse">Loading chart data...</p>
           </div>
        )}

        {/* Render the actual chart component */}
        {/* Only render the chart if there's data to display, prevents errors with empty datasets */}
        {chartData.datasets.length > 0 ? (
            <Line options={options} data={chartData} />
        ) : !isLoadingRealData ? ( // If not loading real data and datasets are empty, show message
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                {USING_MOCK_CANDLE_DATA ? "Generating mock data..." : "No data available for selected tickers."}
            </div>
        ) : null}

      </div>
    </div>
  );
};

export default StockChart;