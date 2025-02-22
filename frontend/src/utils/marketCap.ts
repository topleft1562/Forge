import { INITIAL_PRICE, PRICE_INCREMENT, PRICE_INCREMENT_STEP, totalSupply } from "@/confgi";

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
    const marketCap = priceInUSD * totalSupply;
    
    // Return rounded number to avoid floating point issues
    return Math.round(marketCap * 100) / 100;
};

export const calculateLaunchPrice = async (
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
    
    // Return rounded number to avoid floating point issues
    return priceInUSD;
};

export const calculateCurrentPrice = async (
    reserveOne: number | string, 
    reserveTwo: number | string
): Promise<number> => {
    // Convert inputs to numbers and handle scientific notation
    const tokenAmount = Number(reserveOne);
    console.log("rw:", reserveOne)
    console.log(totalSupply, totalSupply - 1000000)
    const tokensSold = (totalSupply * 1000000) - tokenAmount;
    const priceStep = tokensSold / PRICE_INCREMENT_STEP;
    const priceInSol = (INITIAL_PRICE + (priceStep * PRICE_INCREMENT)) / 1000;
    console.log("currentPrice", priceInSol)
    // Return rounded number to avoid floating point issues
    return priceInSol;
};

export const formatMarketCap = (marketCap: number): string => {
    const formatNumber = (value: number, suffix: string) => {
        if (value >= 1) {
            return `$${value.toFixed(2)}${suffix}`; // Only show 2 decimals if >= 1
        }

        // If value is less than 1, keep up to 12 decimals while removing trailing zeros
        return `$${value.toFixed(16).replace(/\.?0+$/, '')}${suffix}`;
    };

    if (marketCap >= 1_000_000_000) return formatNumber(marketCap / 1_000_000_000, 'B');
    if (marketCap >= 1_000_000) return formatNumber(marketCap / 1_000_000, 'M');
    if (marketCap >= 1_000) return formatNumber(marketCap / 1_000, 'k');
    
    return formatNumber(marketCap, '');
};