let cachedSolPrice: number | null = null;
let lastPriceFetch = 0;
const PRICE_CACHE_DURATION = 30000; // 30 seconds

export const fetchSolPrice = async (): Promise<number> => {
    const now = Date.now();
    
    // Return cached price if valid
    if (cachedSolPrice && (now - lastPriceFetch) < PRICE_CACHE_DURATION) {
        return cachedSolPrice;
    }

    try {
        const response = await fetch('/api/solana/price');
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        
        cachedSolPrice = data.price;
        lastPriceFetch = now;
        
        return data.price;
    } catch (error) {
        console.error('Error fetching SOL price:', error);
        return cachedSolPrice || 100; // Fallback to cached price or 100
    }
};

export const calculateMarketCap = async (
    reserveOne: number | string, 
    reserveTwo: number | string
): Promise<number> => {
    // Convert inputs to numbers and handle scientific notation
    const tokenAmount = Number(reserveOne);
    const solAmount = Number(reserveTwo) / 1e9; // Convert lamports to SOL
    
    // Validate inputs
    if (isNaN(tokenAmount) || isNaN(solAmount)) {
        throw new Error('Invalid reserve values');
    }
    
    if (tokenAmount <= 0) {
        return 0;
    }
    
    // Get SOL price
    const solPrice = await fetchSolPrice();
    
    // Calculate price per token in SOL
    const priceInSol = solAmount / (tokenAmount / 1e6); // Adjust token amount for 6 decimals
    
    // Convert to USD
    const priceInUSD = priceInSol * solPrice;
    
    // Calculate market cap
    const marketCap = priceInUSD * (tokenAmount / 1e6); // Use 6 decimals for total supply
    
    // Return rounded number to avoid floating point issues
    return Math.round(marketCap * 100) / 100;
};

// Add this export
export const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1_000_000_000) return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    if (marketCap >= 1_000_000) return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    if (marketCap >= 1_000) return `$${(marketCap / 1_000).toFixed(2)}k`;
    return `$${marketCap.toFixed(2)}`;
};