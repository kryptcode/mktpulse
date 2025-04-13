
import React, { useMemo, useEffect } from "react";
// Remove the RTK Query import if ONLY using mock data
// import { useGetStockCandlesQuery } from '@/lib/api/finnhubApi';
import type { ChartDataset } from "chart.js";
import {
  addDays,
  addHours,
  addMinutes,
  addWeeks,
//   differenceInDays,
//   differenceInHours,
//   differenceInMinutes,
//   differenceInWeeks,
  getUnixTime,
} from "date-fns";

// --- Configuration ---
const USE_MOCK_DATA = true; // Set to true to use mock data for candles
// -------------------

interface TickerDataSeriesProps {
  ticker: string;
  resolution: string;
  from: number; // Unix timestamp (seconds)
  to: number; // Unix timestamp (seconds)
  index: number;
  onDatasetReady: (
    ticker: string,
    dataset: ChartDataset<"line", { x: number; y: number }[]> | null
  ) => void;
}

// --- Mock Data Generation Helper ---
const generateMockCandleData = (
  from: number, // Unix timestamp (seconds)
  to: number, // Unix timestamp (seconds)
  resolution: string,
  ticker: string, // Use ticker for slight variation
  index: number // Use index for slight variation
): { s: string; t: number[]; c: number[] } => {
  const startDate = new Date(from * 1000);
  const endDate = new Date(to * 1000);
  const timestamps: number[] = [];
  const closingPrices: number[] = [];

  let currentDate = startDate;
  const basePrice = 100 + (ticker.charCodeAt(0) % 20) + index * 5; // Start price varies slightly per ticker
  let price = basePrice;

  const addTimeStep = (date: Date): Date => {
    switch (resolution) {
      case "15":
        return addMinutes(date, 15);
      case "60":
        return addHours(date, 1);
      case "W":
        return addWeeks(date, 1);
      case "D":
      default:
        return addDays(date, 1);
    }
  };

  while (currentDate <= endDate) {
    const currentTimestampSec = getUnixTime(currentDate);
    timestamps.push(currentTimestampSec);

    // Simple random walk for price
    const change = (Math.random() - 0.49) * (basePrice * 0.02); // Fluctuate up to 2% of base
    price += change;
    price = Math.max(price, basePrice * 0.1); // Don't let price fall too low
    closingPrices.push(parseFloat(price.toFixed(2))); // Keep 2 decimal places

    currentDate = addTimeStep(currentDate);

    // Safety break for potential infinite loops
    if (timestamps.length > 2000) {
      console.warn("Mock data generation exceeded 2000 points, breaking.");
      break;
    }
  }

  // Ensure at least one point if interval was too small
  if (timestamps.length === 0 && from < to) {
    timestamps.push(from);
    closingPrices.push(parseFloat(basePrice.toFixed(2)));
  }

  return {
    s: "ok", // Simulate successful API response status
    t: timestamps,
    c: closingPrices,
  };
};
// ---------------------------------

const TickerDataSeries: React.FC<TickerDataSeriesProps> = React.memo(
  ({ ticker, resolution, from, to, index, onDatasetReady }) => {
    // --- Conditionally Fetch or Use Mock Data ---
    // If USE_MOCK_DATA is true, we don't need the hook's results
    let candleData: { s: string; t: number[]; c: number[] } | null = null;
    let isLoading = false;
    let isError = false;
    let error: any = null; // Define error even if not used when mocking

    if (USE_MOCK_DATA) {
      // Generate mock data directly
      candleData = generateMockCandleData(from, to, resolution, ticker, index);
      // isLoading and isError remain false for mock data
    } else {
      // --- Use the actual API hook (keep this section if you might switch back) ---
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const queryResult = useGetStockCandlesQuery(
        { symbol: ticker, resolution, from, to },
        {
          skip:
            !ticker ||
            !resolution ||
            typeof from !== "number" ||
            typeof to !== "number" ||
            from <= 0 ||
            USE_MOCK_DATA,
        }
      );
      candleData = queryResult.data; // Assign data if query runs
      isLoading = queryResult.isLoading;
      isError = queryResult.isError;
      error = queryResult.error; // Assign error if query runs
      // -------------------------------------------------------------------------
    }
    // --- End Conditional Data ---

    const dataset = useMemo(() => {
      console.log(`Memoizing dataset for ${ticker}`, {
        isLoading,
        isError,
        hasCandleData: !!candleData,
        isMock: USE_MOCK_DATA,
      });

      // Handle loading state (only relevant if NOT using mock data)
      if (!USE_MOCK_DATA && isLoading) {
        return {
          label: `${ticker} (Loading...)`,
          data: [],
          borderColor: `hsl(${index * 60}, 70%, 30%)`,
          backgroundColor: `hsla(${index * 60}, 70%, 30%, 0.1)`,
          tension: 0.1,
          pointRadius: 0,
        };
      }

      // Handle error or invalid data (can happen with real API or if mock generation failed unexpectedly)
      if (
        (!USE_MOCK_DATA && isError) ||
        !candleData ||
        candleData.s !== "ok" ||
        !candleData.t ||
        !candleData.c
      ) {
        console.error(`Error or no valid data for ${ticker}:`, {
          isError,
          error,
          status: candleData?.s,
          isMock: USE_MOCK_DATA,
        });
        return {
          label: `${ticker} ${
            USE_MOCK_DATA ? "(Mock Data)" : "(Error/No Data)"
          }`, // Adjust label
          data: [],
          borderColor: `hsl(${index * 60}, 70%, 50%)`,
          backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
          borderDash: isError ? [5, 5] : undefined, // Dashed line only for real errors
          tension: 0.1,
          pointRadius: 0,
        };
      }

      // --- Process valid data (Mock or Real) ---
      const timestamps = candleData.t;
      const closingPrices = candleData.c;
      const formattedData = timestamps.map((ts: number, i: number) => ({
        x: ts * 1000, // Convert seconds to milliseconds
        y: closingPrices[i],
      }));

      return {
        label: `${ticker} ${USE_MOCK_DATA ? "(Simulated)" : ""}`.trim(), // Add indicator to label
        data: formattedData,
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
        tension: 0.1,
        pointRadius: resolution === "D" || resolution === "W" ? 0 : 1,
        pointHoverRadius: 5,
      } as ChartDataset<"line", { x: number; y: number }[]>;

      // Dependencies now include inputs for mock generation if used
    }, [
      ticker,
      resolution,
      index,
      // Include from/to only if using mock data, otherwise rely on candleData changing
      USE_MOCK_DATA ? from : null,
      USE_MOCK_DATA ? to : null,
      // Include these for both cases as they determine the dataset structure
      candleData,
      isLoading,
      isError,
      error,
    ]);

    // Use useEffect to notify the parent when the calculated dataset changes
    useEffect(() => {
      console.log(
        `Calling onDatasetReady for ${ticker} (Mock: ${USE_MOCK_DATA})`
      );
      onDatasetReady(ticker, dataset);
      // Ensure dataset is stable before adding to dependencies if it causes loops
    }, [ticker, dataset, onDatasetReady]); // Depend on the memoized dataset

    return null; // Component doesn't render UI itself
  }
);

TickerDataSeries.displayName = "TickerDataSeries";

export default TickerDataSeries;
