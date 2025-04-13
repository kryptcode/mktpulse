
import { create } from 'zustand';
// Optional: Import persist middleware if you want to save state to localStorage
// import { persist, createJSONStorage } from 'zustand/middleware'

type TimeRange = '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y' | 'MAX'; 

interface UIState {
  selectedTickers: string[];
  addTicker: (ticker: string) => void;
  removeTicker: (ticker: string) => void;
  setSelectedTickers: (tickers: string[]) => void;

  currentTimeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const useUIStore = create<UIState>()(
  // Optional: Wrap with persist middleware
  // persist(
    (set, get) => ({
      selectedTickers: ['AAPL'], // Default starting ticker
      addTicker: (ticker) => {
        const upperTicker = ticker.toUpperCase();
        if (!get().selectedTickers.includes(upperTicker)) {
          set((state) => ({ selectedTickers: [...state.selectedTickers, upperTicker] }));
        }
      },
      removeTicker: (ticker) => set((state) => ({
        selectedTickers: state.selectedTickers.filter(t => t !== ticker.toUpperCase())
      })),
      setSelectedTickers: (tickers) => set({ selectedTickers: tickers.map(t => t.toUpperCase()) }),


      currentTimeRange: '1Y', // Default time range
      setTimeRange: (range) => set({ currentTimeRange: range }),

      searchTerm: '',
      setSearchTerm: (term) => set({ searchTerm: term }),
    }),
  //   {
  //     name: 'ui-preferences-storage', // name of the item in the storage (must be unique)
  //     storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
  //     partialize: (state) => ({
  //       // Only persist certain parts of the state
  //       selectedTickers: state.selectedTickers,
  //       currentTimeRange: state.currentTimeRange,
  //     }),
  //   }
  // ) // End persist wrapper
);