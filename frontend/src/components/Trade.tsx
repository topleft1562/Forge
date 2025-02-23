import { recordInfo } from "@/utils/types";
import { formatSOL, formatTokenAmount, formatDate } from "@/utils/format";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiExternalLink } from 'react-icons/fi';
import { cluster } from "@/confgi";
import { calculateCurrentPrice } from "@/utils/marketCap";

interface TradePropsInfo {
  trade: recordInfo;
  ticker?: string;
}

const DEFAULT_AVATAR = '/default-avatar.png';


export const Trade: React.FC<TradePropsInfo> = ({ trade, ticker = 'tokens' }) => {
  const tradeType = trade.holdingStatus;
  
  // Format the amount based on transaction type
  const formattedAmount = tradeType === 0 
    ? formatSOL(trade.amount) 
    :  tradeType === 1 ? formatTokenAmount(trade.amount)
    : "CREATED"; 
  const formattedAmountOut = tradeType === 1 
    ? formatSOL(trade.amountOut) 
    :  tradeType === 0 ? formatTokenAmount(trade.amountOut)
    : "CREATED"; 
  const formattedAmountPrice = formatSOL(trade.price, 1) 


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
      <div className="hidden md:grid md:grid-cols-7 md:gap-4 md:items-center">

          <div className="px-1 rounded-lg text-white">
          {trade.holder?.name ?? "Unknown"}
          </div>
       

        <p className={`font-medium ${tradeType === 0 ? 'text-[#4BB543]' : 'text-[#FF3B30]' }`}>
          {tradeType === 0 ? "BUY" : tradeType === 1 ? "SELL" : "CREATION"}
        </p>

        <p className="text-white">
          {formattedAmount} {tradeType === 0 ? 'SOL' : ticker}
        </p>

        <p className="text-white">
          {formattedAmountOut} {tradeType === 1 ? 'SOL' : ticker}
        </p>

        <p className="text-white">
          {formattedAmountPrice}
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
            {trade.holder?.name ?? "Unknown"}
            </div>
          </div>
          <p className={`font-medium ${tradeType === 0 ? 'text-[#4BB543]' : 'text-[#FF3B30]'}`}>
          {tradeType === 0 ? "BUY" : tradeType === 1 ? "SELL" : "CREATED"}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-white">
          {formattedAmount} {tradeType === 0 ? 'SOL' : ticker}
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