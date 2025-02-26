export const calculateTokenPrice = (supply: number, reserveBalance: number, constant: number): number => {
    return (reserveBalance * constant) / (supply + 1);
}

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