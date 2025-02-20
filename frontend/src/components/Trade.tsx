import { recordInfo } from "@/utils/types";
import { formatSOL, formatTokenAmount, formatDate } from "@/utils/format";
import Link from "next/link";
import React from "react";
import { FiExternalLink } from 'react-icons/fi';

interface TradePropsInfo {
  trade: recordInfo;
  ticker?: string;
}

const DEFAULT_AVATAR = '/default-avatar.png';
const cluster = process.env.SOLANA_NETWORK! as Cluster

export const Trade: React.FC<TradePropsInfo> = ({ trade, ticker = 'tokens' }) => {
  const isBuy = trade.holdingStatus === 2;
  
  // Format the amount based on transaction type
  const formattedAmount = isBuy 
    ? formatSOL(trade.amount) 
    : formatTokenAmount(trade.amount); 
  
  // Simplified date format
  const formattedDate = typeof trade.time === 'string' 
    ? formatDate(trade.time)
    : trade.time.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
 
  return (
    <div className="my-2 bg-[#0c1015] rounded-xl p-4">
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-4 md:items-center">
        <div className="flex items-center">
          <img
            src={DEFAULT_AVATAR}
            alt="IMG"
            className="rounded-lg mr-3"
            width={40}
            height={40}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = DEFAULT_AVATAR;
            }}
          />
          <div className="px-3 rounded-lg text-white">
            {trade.holder.name}
          </div>
        </div>
        <p className={`font-medium ${isBuy ? 'text-[#4BB543]' : 'text-[#FF3B30]'}`}>
          {isBuy ? "BUY" : "SELL"}
        </p>
        <p className="text-white">
          {formattedAmount} {isBuy ? 'SOL' : ticker}
        </p>
        <p className="text-[#888]">
          {formattedDate}
        </p>
        <Link 
          href={`https://solscan.io/tx/${trade.tx}?cluster=${cluster}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center text-[#01a8dd] hover:text-[#01a8dd]/80 transition-colors">
            <FiExternalLink className="mr-1" />
            <span>{trade.tx.slice(0, 6)}</span>
          </div>
        </Link>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={DEFAULT_AVATAR}
              alt="IMG"
              className="rounded-lg"
              width={32}
              height={32}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DEFAULT_AVATAR;
              }}
            />
            <div className="text-white">
              {trade.holder.name}
            </div>
          </div>
          <p className={`font-medium ${isBuy ? 'text-[#4BB543]' : 'text-[#FF3B30]'}`}>
            {isBuy ? "BUY" : "SELL"}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-white">
            {formattedAmount} {isBuy ? 'SOL' : ticker}
          </p>
          <p className="text-[#888] text-sm">
            {formattedDate}
          </p>
        </div>
        
        <Link 
          href={`https://solscan.io/tx/${trade.tx}?cluster=${cluster}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="flex items-center text-[#01a8dd] hover:text-[#01a8dd]/80 transition-colors text-sm">
            <FiExternalLink className="mr-1" />
            <span className="truncate">{trade.tx}</span>
          </div>
        </Link>
      </div>
    </div>
  );
};