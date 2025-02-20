import { useEffect, useState } from 'react';
import { calculateMarketCap, formatMarketCap, fetchSolPrice } from '@/utils/marketCap';
import { TargetMarketCap, TargetSOL } from '@/confgi';

interface MarketCapProps {
    reserveOne: number;
    reserveTwo: number;
    targetCap?: number;
}

export const MarketCap: React.FC<MarketCapProps> = ({ 
    reserveOne, 
    reserveTwo, 
    targetCap = TargetMarketCap
}) => {
    const [marketCap, setMarketCap] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const updateMarketCap = async () => {
            try {
                setIsLoading(true);
                const mcap = await calculateMarketCap(reserveOne, reserveTwo);
                setMarketCap(mcap);
                const value = Math.min(100, Math.max(0, (reserveTwo / TargetSOL) * 100));
                setProgress(100 - value);
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
    }, [reserveOne, reserveTwo, targetCap]);

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
                        Target: {formatMarketCap(targetCap)}
                    </div>
                </div>
            </div>
        </div>
    );
};