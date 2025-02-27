import { NextResponse } from 'next/server';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache
let priceCache = {
    price: 0,
    lastUpdated: 0
};

async function fetchSolanaPrice() {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
            {
                headers: {
                    'Accept': 'application/json',
                    // Add your API key if you have one
                    // 'X-CG-Pro-API-Key': process.env.COINGECKO_API_KEY
                }
            }
        );
        console.log("testing", response)
        
        if (!response.ok) {
            throw new Error('Failed to fetch SOL price');
        }

        const data = await response.json();
        return data.solana.usd;
    } catch (error) {
        console.error('Error fetching Solana price:', error);
        throw error;
    }
}

export async function GET() {
    try {
        const now = Date.now();
        
        // Check if cache is valid
        if (priceCache.price && (now - priceCache.lastUpdated) < CACHE_DURATION) {
            return NextResponse.json({ price: priceCache.price });
        }

        // Fetch new price
        const price = await fetchSolanaPrice();
        
        // Update cache
        priceCache = {
            price,
            lastUpdated: now
        };

        return NextResponse.json({ price });
    } catch (error) {
        console.error('Price fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch SOL price' },
            { status: 500 }
        );
    }
}