interface ChartDataParams {
    token: string;
    from: number;
    to: number;
    range: number;
    reserveOne: number;  // Token amount (6 decimals)
    reserveTwo: number;  // SOL amount (9 decimals)
}

export const getChartData = async ({
    token,
    from,
    to,
    range,
    reserveOne,
    reserveTwo
}: ChartDataParams) => {
    // Calculate current price
    const solAmount = reserveTwo / 1e9;        // Convert from lamports
    const tokenAmount = reserveOne / 1e6;      // Convert from 6 decimals
    const solPrice = 406;                      // Current SOL price
    
    const priceInSol = solAmount / tokenAmount;
    const priceInUSD = priceInSol * solPrice;
    
    console.log('Price calculation:', {
        solAmount,
        tokenAmount,
        priceInSol,
        priceInUSD
    });

    // Create a single bar for now
    const currentBar = {
        time: Math.floor(Date.now() / 1000),
        open: priceInUSD,
        high: priceInUSD,
        low: priceInUSD,
        close: priceInUSD,
        volume: 0
    };

    return {
        table: [currentBar]
    };
};