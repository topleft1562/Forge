import { coinInfo, userInfo } from "@/utils/types";
import { getMessageByCoin, getUserInfo } from "@/utils/util";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { calculateMarketCap, formatMarketCap } from "@/utils/marketCap";
import { GiThorHammer } from "react-icons/gi";
import { BiSolidComment } from "react-icons/bi";
import { TimeAgo } from "@/utils/format";

interface CoinBlogProps {
  coin: coinInfo;
  componentKey: string;
}

export const CoinBlog: React.FC<CoinBlogProps> = ({ coin, componentKey }) => {
  const [marketCap, setMarketCap] = useState<string>("0");
  const [isKing, setIsKing] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [ replies, setReplies ] = useState(0)
  const createdAge = TimeAgo(coin?.date)

  useEffect(() => {
    const updateMarketCap = async () => {
      try {
        if (!coin?.reserveOne || !coin?.reserveTwo) {
          // console.warn('Missing reserve values:', coin);
          // return;
        }
        
        const mcap = await calculateMarketCap(coin.reserveOne, coin.reserveTwo);
        setMarketCap(formatMarketCap(mcap));
        setIsKing(mcap > 35000)
        setError(null);
      } catch (err) {
        console.error('Error updating market cap:', err);
        setError('Failed to update market cap');
      }
      const messages = await getMessageByCoin(coin._id as string)
      setReplies(messages.length)
    };

    updateMarketCap();
    const interval = setInterval(updateMarketCap, 3000);
    return () => clearInterval(interval);
  }, [coin?.reserveOne, coin?.reserveTwo]);

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
      {replies ?? 0}
    </span>
  );

  return (
    <Link href={`/trading/${coin?._id}`} className="block w-full">
    <div
      className={`flex w-full sm:w-[380px] items-center justify-center p-4 relative
        ${componentKey !== "king" ? `
          transition-all duration-300 ease-out
          hover:bg-[#01a8dd]/5 hover:backdrop-blur-sm
          rounded-lg border border-transparent
          hover:border-[#01a8dd]/10
        ` : ''}`}
    >
      <img src={coin?.url} alt="image" className="w-24 sm:w-32 max-h-32 object-contain px-2 sm:px-3" />

      <div className="flex-1 min-w-0">
        <div className="flex justify-center  mb-2">
          <div className="text-white truncate text-center">
            {coin?.name}
            <span className="text-[#888]">&nbsp;&nbsp;&nbsp;{`( ${coin?.ticker} )`}</span>
          </div>
        </div>


        <div className="flex items-center gap-1 text-xs ">
          <div className="text-[#888]">Launched:</div>
          <div className="text-[#01a8dd]/80">
            <span>{createdAge}</span>
          </div>
        </div>

        <div className="text-base sm:text-lg font-semibold flex items-center flex-wrap justify-between w-full">
          <span className="text-[#888] relative group">
            market cap:
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01a8dd] to-[#4088ae] truncate">
            {marketCap} {isKing && '👑'}
          </span>
        </div>

        
        {componentKey === "coin" && coin?.description && (
          <div className="text-[#ddd] leading-4 line-clamp-2 text-[10px] sm:text-xs mb-2">
            {coin.description}
          </div>
        )}


        <div className="flex justify-between items-center text-[11px] mt-3">
          <RepliesLabel />
          <Link
            href={`/profile/${(coin?.creator as userInfo)?._id}`}
            className="relative flex items-center gap-1 px-2 py-1 group transition-all rounded-lg border-2 border-transparent hover:border-[#01a8dd]"
          >
            <div className="relative flex items-center gap-1 text-[#01a8dd]/80 transition-all">
              <CreatorLabel />
              <span className="-ml-1">{(coin?.creator as userInfo)?.name}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  </Link>
  );
};