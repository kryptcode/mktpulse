"use client";

import React from "react";
import TickerSearch from "@/components/TickerSearch";
import SelectedTickers from "@/components/SelectedTickers";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import StockChart from "@/components/StockChart";
import StockQuote from "@/components/StockQuote";
import { useUIStore } from "@/stores/uiStore";
import { GithubIcon } from "lucide-react";

export default function DashboardPage() {
  const { selectedTickers } = useUIStore();

  return (
    <main className="container mx-auto p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium text-gray-800 dark:text-gray-100">
          MktPulse
        </h1>

        <a
          href="https://github.com/kryptcode/mktpulse"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-100 shadow-sm rounded-lg p-1.5 px-3"
        >
            <GithubIcon size={22} />
        </a>
      </div>

      {/* --- Main Chart Area --- */}
      {selectedTickers.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 min-h-[400px]">
          <StockChart />
        </div>
      ) : null}

      {/* --- Top Control Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2">
          <TickerSearch />
          <SelectedTickers />
        </div>
        <div className="md:col-span-1 h-full">
          <TimeRangeSelector />
        </div>
      </div>

      {/* --- Quote Display Area --- */}
      {selectedTickers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Map over selected tickers and render a StockQuote for each */}
          {selectedTickers.map((ticker) => (
            <StockQuote key={ticker} ticker={ticker} />
          ))}
        </div>
      )}
    </main>
  );
}
