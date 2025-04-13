# MktPulse - Stock Market Dashboard


MktPulse is a web application designed to provide users with insights into the stock market. It allows searching for stock tickers, viewing interactive price charts over various time ranges, and displaying current quote information for selected stocks.
---

**⚠️ Important Note on Chart Data:**

Currently, the historical stock candle charts in this application use **simulated mock data**. Accessing real-time and historical candle data from the [Finnhub API](https://finnhub.io/) requires a premium subscription. The application is configured to use mock data by default to allow demonstration without incurring API costs. Real-time quote data and symbol search *do* use the live Finnhub API via a secure proxy.

If you have a premium Finnhub API key, you can switch to using live chart data by modifying the configuration (see **Environment Variables** section below).

---

## Key Features

*   **Ticker Search:** Real-time search for stock symbols using the Finnhub API.
*   **Ticker Selection:** Add and remove multiple tickers to your dashboard view.
*   **Interactive Stock Charts:**
    *   Display price history for multiple selected tickers on a single chart.
    *   Selectable time ranges (1D, 5D, 1M, 6M, 1Y, 5Y, MAX).
    *   Powered by Chart.js for smooth interaction (zoom/pan capabilities depend on Chart.js plugins, not included by default).
    *   **Uses mock data by default (See note above).**
*   **Stock Quotes:** View latest price information (open, high, low, current, previous close) for each selected ticker.
*   **Responsive Design:** Adapts to different screen sizes using Tailwind CSS.
*   **API Key Security:** Uses a Next.js API route as a proxy to securely handle the Finnhub API key on the server-side.
*   **State Management:** Clean global state management using Zustand.
*   **Efficient Data Fetching:** Uses RTK Query for client-side data fetching and caching.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Data Fetching (Client):** [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) (Redux Toolkit)
*   **Charting:** [Chart.js](https://www.chartjs.org/) with [react-chartjs-2](https://react-chartjs-2.js.org/)
*   **Date Handling:** [date-fns](https://date-fns.org/)
*   **API Provider:** [Finnhub.io](https://finnhub.io/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (Version 18.x or later recommended)
*   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/) package manager

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kryptcode/mktpulse.git
    cd mktpulse
    ```
    <!-- **Action:** Replace [YourUsername]/[YourRepoName] with your actual GitHub username and repository name -->

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

3.  **Set up Environment Variables:**
    *   You need an API key from [Finnhub.io](https://finnhub.io/) (a free key is sufficient for quote and search functionality).
    *   Create a file named `.env.local` in the root of the project.
    *   Add your Finnhub API key to this file:
        ```plaintext
        # .env.local
        FINNHUB_API_KEY=your_finnhub_api_key_here
        ```
    *   **Note:** The `.env.local` file is ignored by Git (`.gitignore`) to keep your key private. The application uses a server-side proxy (`/app/api/finnhub/[..proxy]/route.ts`) so this key is **never exposed** to the client browser.

4.  **(Optional) Switch to Live Chart Data:**
    *   If you have a **premium** Finnhub API key and want to use live candle data for charts:
        *   Open the file `src/components/TickerDataSeries.tsx`.
        *   Find the line `const USE_MOCK_DATA = true;` near the top.
        *   Change it to `const USE_MOCK_DATA = false;`.
        *   Open the file `src/components/StockChart.tsx`.
        *   Find the line `const USING_MOCK_CANDLE_DATA = true;` near the top.
        *   Change it to `const USING_MOCK_CANDLE_DATA = false;`.
    *   Remember that using the live candle endpoint frequently may incur costs depending on your Finnhub subscription.

### Running the Development Server

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```

2.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

You should now see the MktPulse application running locally!

## Project Structure (Simplified)

├── app/ # Next.js App Router
│ ├── (dashboard)/ # Route group for main dashboard layout
│ │ └── page.tsx # Dashboard main page component
│ ├── api/ # API Routes (Proxy)
│ │ └── finnhub/
│ │ └── [...proxy]/
│ │ └── route.ts # Server-side proxy for Finnhub API
│ ├── layout.tsx # Root layout
│ └── ... # Other root files (globals.css, etc.)
├── components/ # Reusable React components
│ ├── StockChart.tsx # Main chart component
│ ├── StockQuote.tsx # Component for displaying single quote
│ ├── TickerDataSeries.tsx # Helper component for fetching/mocking chart data per ticker
│ ├── TickerSearch.tsx # Search input component
│ ├── SelectedTickers.tsx # Component to display/remove selected tickers
│ └── TimeRangeSelector.tsx # Buttons for time range selection
├── lib/ # Libraries, utilities, API definitions
│ └── api/
│ └── finnhubApi.ts # RTK Query API slice definition
├── stores/ # Zustand state management stores
│ └── uiStore.ts # UI state (selected tickers, time range, etc.)
├── public/ # Static assets
├── styles/ # Global styles
├── .env.local # Local environment variables (API Key - Not committed)
├── next.config.mjs # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json # TypeScript configuration
└── package.json # Project dependencies and scripts