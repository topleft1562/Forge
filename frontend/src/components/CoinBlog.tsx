import { coinInfo, userInfo } from "@/utils/types";
import { getUserInfo } from "@/utils/util";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { calculateMarketCap, formatMarketCap } from "@/utils/marketCap";
import { GiThorHammer } from "react-icons/gi";
import { BiSolidComment } from "react-icons/bi";

interface CoinBlogProps {
  coin: coinInfo;
  componentKey: string;
}

export const CoinBlog: React.FC<CoinBlogProps> = ({ coin, componentKey }) => {
  const [marketCap, setMarketCap] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateMarketCap = async () => {
      try {
        if (!coin?.reserveOne || !coin?.reserveTwo) {
          // console.warn('Missing reserve values:', coin);
          // return;
        }
        
        const mcap = await calculateMarketCap(coin.reserveOne, coin.reserveTwo);
        setMarketCap(formatMarketCap(mcap));
        setError(null);
      } catch (err) {
        console.error('Error updating market cap:', err);
        setError('Failed to update market cap');
      }
    };

    updateMarketCap();
    const interval = setInterval(updateMarketCap, 30000);
    return () => clearInterval(interval);
  }, [coin?.reserveOne, coin?.reserveTwo]);

  const MarketCapLabel = ({ isKing = false }: { isKing?: boolean }) => (
    <span className="text-[#888] mr-2 relative group cursor-help">
      {isKing ? 'market cap:' : 'MC:'}
      <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-1 
        px-2 py-1 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap
        border border-[#01a8dd]/20">
        Market Cap
      </span>
    </span>
  );

  const CreatorLabel = () => (
    <span className="relative group flex items-center">
      <GiThorHammer className="text-[#01a8dd]/60 w-[14px] h-[14px] mr-1" />
      <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-1 
        px-2 py-1 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap
        border border-[#01a8dd]/20">
        Created by
      </span>
    </span>
  );

  const RepliesLabel = () => (
    <span className="relative group flex items-center text-[#888]">
      <BiSolidComment className="w-[11px] h-[11px] mr-1" />
      <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-1 
        px-2 py-1 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap
        border border-[#01a8dd]/20">
        Replies
      </span>
      {coin?.replies || 0}
    </span>
  );

  return (
    <div className={`flex w-full sm:w-[380px] items-center justify-center p-4 
      ${componentKey !== "king" ? `
        transition-all duration-300 ease-out
        hover:bg-[#01a8dd]/5 hover:backdrop-blur-sm
        rounded-lg border border-transparent
        hover:border-[#01a8dd]/10
      ` : ''}`}
    >
      <img src={coin?.url} alt="image" className="w-24 sm:w-32 object-contain px-2 sm:px-3" />
      <div className="flex-1 min-w-0">
        {componentKey === "king" ? (
          <>
            <div className="text-white mb-2 truncate">
              {coin?.name}
              <span className="text-[#888]">
                &nbsp;&nbsp;&nbsp;{coin?.ticker}
              </span>
            </div>
            
            <div className="text-base sm:text-lg font-semibold mb-2 flex items-center flex-wrap">
              <MarketCapLabel isKing={true} />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01a8dd] to-[#4088ae] truncate">
                {marketCap}
              </span>
              {coin?.marketcap > 50000 && '👑'}
            </div>

            <div className="flex items-center text-[11px] truncate">
              <CreatorLabel />
              <Link href={`/profile/${(coin?.creator as userInfo)?._id}`} className="truncate">
                <div className="hover:border-[#01a8dd]/40 border-b border-transparent transition-colors text-[#01a8dd]/80 truncate">
                  {(coin?.creator as userInfo)?.name}
                </div>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-white truncate">
              {coin?.name}
              <span className="text-[#888]">
                &nbsp;&nbsp;&nbsp;{coin?.ticker}
              </span>
            </div>

            <div className="text-base sm:text-lg font-semibold flex items-center flex-wrap">
              <MarketCapLabel />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01a8dd] to-[#4088ae] truncate">
                {marketCap}
              </span>
              {coin?.marketcap > 50000 && '👑'}
            </div>

            {componentKey === "coin" && coin?.description && (
              <div className="text-[#888] leading-4 line-clamp-2 text-xs sm:text-sm mb-2">
                {coin.description}
              </div>
            )}

            <div className="flex justify-between items-center text-[11px] mt-3">
              {componentKey !== "king" && <RepliesLabel />}
              <div className="flex items-center truncate">
                <CreatorLabel />
                <Link href={`/profile/${(coin?.creator as userInfo)?._id}`} className="truncate">
                  <div className="hover:border-[#01a8dd]/40 border-b border-transparent transition-colors text-[#01a8dd]/80 truncate">
                    {(coin?.creator as userInfo)?.name}
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};