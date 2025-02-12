"use client";
import { Chatting } from "@/components/Chatting";
import { CoinBlog } from "@/components/CoinBlog";
import { Holders } from "@/components/Holders";
import { TradeForm } from "@/components/TradeForm";
import { TradingChart } from "@/components/TVChart/TradingChart";
import { coinInfo } from "@/utils/types";
import {
    getCoinInfo,
    getCoinTrade,
    getCoinsInfoBy,
    getCoinsInfo,
} from "@/utils/util";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MarketCap } from "@/components/MarketCap";
import { formatFullNumber, formatSOL } from "@/utils/format";
import { GiThorHammer } from "react-icons/gi";
import { FaTwitter, FaTelegram } from "react-icons/fa";
import { calculateMarketCap, formatMarketCap } from "@/utils/marketCap";
import { ImageModal } from "@/components/ImageModal";
import { ProgramProvider } from "@/contexts/ProgramProvider";

export default function Page() {
    const pathname = usePathname();
    const [param, setParam] = useState<string>("");
    const [progress, setProgress] = useState<Number>(60);
    const [coin, setCoin] = useState<coinInfo>({} as coinInfo);
    const [marketCap, setMarketCap] = useState<string>("0");
    const [isKing, setIsKing] = useState<boolean>(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [showMobileTradeForm, setShowMobileTradeForm] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const shouldShowReadMore = (coin?.description?.length || 0) > 120;
    const description = isDescriptionExpanded
        ? coin?.description
        : coin?.description?.slice(0, 120) + (shouldShowReadMore ? "... " : "");

    useEffect(() => {
        const fetchData = async () => {
            // Split the pathname and extract the last segment
            const segments = pathname.split("/");
            const parameter = segments[segments.length - 1];
            setParam(parameter);
            const data = await getCoinInfo(parameter);
            setCoin(data);
            const value = Math.floor(data.reserveOne / 10_000_000_000_000);
            setProgress(100 - value);
        };
        fetchData();
    }, [pathname]);

    useEffect(() => {
        const updateMarketCap = async () => {
            try {
                if (!coin?.reserveOne || !coin?.reserveTwo) {
                    return;
                }
                const mcap = await calculateMarketCap(
                    coin.reserveOne,
                    coin.reserveTwo
                );
                setMarketCap(formatMarketCap(mcap));

                // Check if this token has the highest market cap
                const allCoins = await getCoinsInfo();
                if (allCoins && allCoins.length > 0) {
                    let highestMcap = 0;
                    for (const c of allCoins) {
                        const otherMcap = (c.reserveOne * c.reserveTwo) / 1e9;
                        if (otherMcap > highestMcap) {
                            highestMcap = otherMcap;
                        }
                    }
                    const currentMcap =
                        (coin.reserveOne * coin.reserveTwo) / 1e9;
                    setIsKing(currentMcap >= highestMcap);
                }
            } catch (err) {
                console.error("Error updating market cap:", err);
            }
        };

        updateMarketCap();
        const interval = setInterval(updateMarketCap, 30000);
        return () => clearInterval(interval);
    }, [coin?.reserveOne, coin?.reserveTwo]);

    // Add this function to handle image errors
    const handleImageError = (
        e: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
        e.currentTarget.src = "/sol-forge-logo.png";
    };

    // Add this function to get a valid image URL
    const getImageUrl = (url?: string) => {
        if (!url || url.includes("undefined")) {
            return "/sol-forge-logo.png";
        }
        return url;
    };

    return (
        <ProgramProvider>
            <div className="min-h-screen">
                <div className="max-w-[1600px] mx-auto px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-[68%] space-y-8">
                            <div className="infoHolder bg-[#1a1a1a] rounded-xl p-6">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="shrink-0">
                                        <img
                                            src={getImageUrl(coin?.url)}
                                            alt={coin?.name}
                                            className="w-full sm:w-auto h-[116px] max-w-[200px] mx-auto sm:mx-0 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity !rounded-lg"
                                            onClick={() =>
                                                setIsImageModalOpen(true)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-4 sm:max-w-[400px]">
                                        <div className="space-y-2">
                                            <h1 className="flex items-center gap-3">
                                                <span className="text-2xl font-medium text-white">
                                                    {coin?.name}
                                                </span>
                                                <span className="text-[#888] text-lg">
                                                    {coin?.ticker}
                                                </span>
                                            </h1>

                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <div className="flex items-center text-[#01a8dd]/60">
                                                    <GiThorHammer className="w-[14px] h-[14px] mr-1" />
                                                    <Link
                                                        href={`/profile/${
                                                            (
                                                                coin?.creator as any
                                                            )?._id
                                                        }`}
                                                    >
                                                        <span className="hover:text-[#01a8dd] transition-colors">
                                                            {
                                                                (
                                                                    coin?.creator as any
                                                                )?.name
                                                            }
                                                        </span>
                                                    </Link>
                                                </div>

                                                <div className="text-[#888]">
                                                    Created{" "}
                                                    {/* Add your time ago logic here */}{" "}
                                                    ago
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-2">
                                                <button className="px-4 py-2 rounded-lg bg-[#1E1E1E] text-[#01a8dd]/80 hover:text-[#01a8dd] transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <FaTwitter size={16} />
                                                        <span className="text-sm">
                                                            Twitter
                                                        </span>
                                                    </div>
                                                </button>
                                                <button className="px-4 py-2 rounded-lg bg-[#1E1E1E] text-[#01a8dd]/80 hover:text-[#01a8dd] transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <FaTelegram size={16} />
                                                        <span className="text-sm">
                                                            Telegram
                                                        </span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-[200px] space-y-2">
                                        <div className="space-y-2">
                                            <div className="text-[#888] text-sm leading-relaxed flex flex-wrap items-center gap-1">
                                                <span>
                                                    {description ||
                                                        "No description available"}
                                                </span>
                                                {shouldShowReadMore && (
                                                    <button
                                                        onClick={() =>
                                                            setIsDescriptionExpanded(
                                                                !isDescriptionExpanded
                                                            )
                                                        }
                                                        className="text-[#01a8dd] text-sm hover:text-[#01a8dd]/80 transition-colors flex items-center gap-1"
                                                    >
                                                        {isDescriptionExpanded ? (
                                                            <>
                                                                Close
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M5 15l7-7 7 7"
                                                                    />
                                                                </svg>
                                                            </>
                                                        ) : (
                                                            <>
                                                                Read more
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M19 9l-7 7-7-7"
                                                                    />
                                                                </svg>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <p className="text-xs text-[#888]">
                                                    Bonding Curve
                                                </p>
                                                <span className="text-xs text-[#01a8dd]">
                                                    {progress.toString()}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#01a8dd] transition-all duration-300"
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-4 sm:gap-0">
                                        <div>
                                            <div className="text-2xl font-bold text-[#01a8dd]">
                                                {marketCap}
                                            </div>
                                            <div className="text-sm text-[#888]">
                                                Market Cap
                                            </div>
                                        </div>
                                        {isKing && (
                                            <div className="flex flex-col items-center justify-center sm:mt-4">
                                                <div className="relative">
                                                    <GiThorHammer
                                                        size={32}
                                                        className="text-[#01a8dd] animate-pulse"
                                                    />
                                                    <div className="absolute inset-0 bg-[#01a8dd] blur-lg opacity-20 rounded-full" />
                                                </div>
                                                <div className="mt-1 text-xs font-medium bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-transparent bg-clip-text animate-gradient">
                                                    Forge Master
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowMobileTradeForm(true)}
                                className="w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity lg:hidden"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(9deg, rgb(0, 104, 143) 0%, rgb(138, 212, 249) 100%)",
                                }}
                            >
                                Trade Token
                            </button>

                            <div className="bg-[#1a1a1a] rounded-xl p-1">
                                <TradingChart param={coin}></TradingChart>
                            </div>
                            <div className="bg-[#1a1a1a] rounded-xl p-6">
                                <Chatting param={param} coin={coin}></Chatting>
                            </div>
                        </div>

                        <div className="w-full lg:w-[32%] space-y-8 hidden lg:block">
                            <TradeForm coin={coin} />

                            <div className="bg-[#151515] rounded-xl p-6 space-y-8">
                                <MarketCap
                                    reserveOne={coin.reserveOne}
                                    reserveTwo={coin.reserveTwo}
                                    targetCap={65000}
                                />

                                <div className="space-y-4">
                                    <p className="text-sm text-[#888] leading-relaxed">
                                        When market cap reaches $65k all
                                        liquidity from the bonding curve will be
                                        deposited into Raydium and burned.
                                        Progression increases as buys comes in
                                        and MC increases.
                                    </p>
                                    <p className="text-sm text-[#888] leading-relaxed">
                                        There is{" "}
                                        {formatFullNumber(coin.reserveOne)}{" "}
                                        {coin.ticker} available for sale in the
                                        bonding curve and there is{" "}
                                        {formatSOL(coin.reserveTwo - 30e9)} SOL
                                        in the pool.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-white font-medium">
                                            Holder Distribution
                                        </h3>
                                        <button className="px-3 py-1.5 rounded-lg bg-[#1E1E1E] text-[#01a8dd]/80 hover:text-[#01a8dd] text-sm transition-colors">
                                            Generate Map
                                        </button>
                                    </div>
                                    <Holders
                                        param={param}
                                        coin={coin}
                                    ></Holders>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showMobileTradeForm && (
                <div className="fixed inset-0 bg-black/80 z-50 lg:hidden">
                    <div className="min-h-screen flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-[#3c3f44]">
                            <h2 className="text-lg font-medium text-white">
                                Trade {coin?.name}
                            </h2>
                            <button
                                onClick={() => setShowMobileTradeForm(false)}
                                className="text-[#888] hover:text-white transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <TradeForm coin={coin} />
                        </div>
                    </div>
                </div>
            )}

            <ImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={getImageUrl(coin?.url)}
            />
        </ProgramProvider>
    );
}