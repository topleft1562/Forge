import { useEffect, useState } from 'react';
import { calculateMarketCap, formatMarketCap, calculateLaunchPrice, calculateCurrentPrice, fetchSolPrice, formatTokenGoal } from '@/utils/marketCap';
import { totalSupply, willMigrateAt } from '@/confgi';

interface MarketCapProps {
    reserveOne: number;
    reserveTwo: number;
    lastPrice: string;
}

export const MarketCap: React.FC<MarketCapProps> = ({ 
    reserveOne = 0, 
    reserveTwo = 0,
    lastPrice = "0"
}) => {
    const [marketCap, setMarketCap] = useState<number>(0);
    const [tMarket, settMarket] = useState(1)
    const [launchPrice, setLaunchPrice] = useState<number>(0);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const updateMarketCap = async () => {
            try {
                setIsLoading(true);
                const mcap = await calculateMarketCap(reserveOne, reserveTwo);
                setMarketCap(mcap);
                const lprice = await calculateLaunchPrice(reserveOne, reserveTwo)
                setLaunchPrice(lprice)
                const cprice = await calculateCurrentPrice(lastPrice)
                setCurrentPrice(cprice)
                const tokensSold = totalSupply - reserveOne
                const value = Math.min(100, Math.max(0, (tokensSold / willMigrateAt) * 100));
                setProgress(value);
                const tmc = (willMigrateAt / 1e6)
                settMarket(tmc)
                setError(null);
            } catch (error) {
                console.error('Error calculating market cap:', error);
                setError('Failed to calculate market cap');
            } finally {
                setIsLoading(false);
            }
        };
    
        updateMarketCap();
        const interval = setInterval(updateMarketCap, 5000);
        return () => clearInterval(interval);
    }, [reserveOne, reserveTwo, willMigrateAt]);

    if (error) {
        return (
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="progressHolder relative rounded-lg shadow-lg isolate overflow-hidden">
            <div className="absolute inset-[-1px] z-[-1]">
                <div className="absolute inset-[-5px]" />
                <div className="absolute inset-[-5px]" />
            </div>
            <div className="relative z-[1] bg-[#1e1f23] rounded-lg p-6">
                <div className="text-3xl font-bold text-white mb-4">
                    {isLoading ? (
                        <span className="animate-pulse">Loading...</span>
                    ) : (
                        formatMarketCap(marketCap)
                    )}
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-[#888]">Bonding Curve</span>
                        <span className="text-[#01a8dd]">{progress.toFixed(1)}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-[#48a8de] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                        Target: {formatTokenGoal(tMarket)}
                    </div>
                    <div className="text-xs text-gray-500">
                        Launch Price: {formatMarketCap(launchPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                        Current Price: {formatMarketCap(currentPrice)}
                    </div>
                </div>
            </div>
        </div>
    );
};