"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSolPrice = exports.calculateTokenPrice = void 0;
const calculateTokenPrice = (supply, reserveBalance, constant) => {
    return (reserveBalance * constant) / (supply + 1);
};
exports.calculateTokenPrice = calculateTokenPrice;
const CACHE_DURATION = 60 * 1000; // 1 minute cache duration
let priceCache = {
    price: 0,
    lastUpdated: 0
};
async function fetchSolPrice() {
    try {
        const now = Date.now();
        // Return cached value if still valid
        if (priceCache.price && (now - priceCache.lastUpdated) < CACHE_DURATION) {
            return priceCache.price;
        }
        // Fetch new price
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
            headers: {
                'Accept': 'application/json',
                // 'X-CG-Pro-API-Key': process.env.COINGECKO_API_KEY, // Add API key if needed
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch price`);
        }
        const data = await response.json();
        const price = data?.solana?.usd || 0;
        console.log("Fetched New Price", price);
        // Update cache
        priceCache = {
            price,
            lastUpdated: now
        };
        return price;
    }
    catch (error) {
        console.error(`Error fetching SOL price:`, error);
        return priceCache.price || 0; // Return last known price if available
    }
}
exports.fetchSolPrice = fetchSolPrice;
