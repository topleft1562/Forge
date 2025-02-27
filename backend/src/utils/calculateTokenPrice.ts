export const calculateTokenPrice = (supply: number, reserveBalance: number, constant: number): number => {
    return (reserveBalance * constant) / (supply + 1);
}

export async function fetchSolPrice(): Promise<number> {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
            {
                headers: {
                    'Accept': 'application/json',
                    // 'X-CG-Pro-API-Key': process.env.COINGECKO_API_KEY, // Add API key if needed
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch price`);
        }

        const data = await response.json();
        return data?.solana?.usd || 0; // ✅ Corrected path to access price
    } catch (error) {
        console.error(`Error fetching SOL price:`, error);
        return 0; // Fallback value if API call fails
    }
}

