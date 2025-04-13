
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { proxy: string[] } }
) {
  if (!API_KEY) {
    return NextResponse.json(
      { message: 'API key is not configured' },
      { status: 500 }
    );
  }

  // 1. Construct the target Finnhub URL
  const finnhubPath = params.proxy.join('/'); // e.g., ['search'] -> 'search' or ['stock', 'candle'] -> 'stock/candle'
  const searchParams = request.nextUrl.searchParams; // Get query params from incoming request (?q=msft)
  searchParams.set('token', API_KEY); // Add the API key securely

  const targetUrl = `${FINNHUB_BASE_URL}/${finnhubPath}?${searchParams.toString()}`;

  // 2. Make the request from the server to Finnhub
  try {
    const finnhubResponse = await fetch(targetUrl, {
      headers: {
        // Finnhub doesn't typically require special headers other than the token
        'Content-Type': 'application/json',
      },
      // Add caching strategy if desired (Next.js fetch extension)
      // next: { revalidate: 60 } // Revalidate every 60 seconds example
    });

    // 3. Handle potential errors from Finnhub
    if (!finnhubResponse.ok) {
      const errorBody = await finnhubResponse.text();
      console.error(
        `Finnhub API Error (${finnhubResponse.status}): ${errorBody}`
      );
      return NextResponse.json(
        {
          message: `Error from Finnhub: ${finnhubResponse.statusText}`,
          details: errorBody,
        },
        { status: finnhubResponse.status }
      );
    }

    // 4. Stream the response back to the client
    // For JSON:
    const data = await finnhubResponse.json();
    return NextResponse.json(data);

    // For streaming non-JSON if needed (less common for Finnhub):
    // const body = finnhubResponse.body;
    // return new NextResponse(body, {
    //   status: finnhubResponse.status,
    //   statusText: finnhubResponse.statusText,
    //   headers: finnhubResponse.headers,
    // });

  } catch (error: any) {
    console.error('Error fetching from Finnhub proxy:', error);
    return NextResponse.json(
      { message: 'Internal Server Error proxying to Finnhub', details: error.message },
      { status: 500 }
    );
  }
}

// You might need POST/PUT etc. handlers here if you used other methods
// export async function POST(request: NextRequest, { params }: { params: { proxy: string[] } }) { ... }