"use client";
import { Chatting } from "@/components/Chatting";
import { Holders } from "@/components/Holders";
import { TradeForm } from "@/components/TradeForm";
import { TradingChart } from "@/components/TVChart/TradingChart";
import { coinInfo } from "@/utils/types";
import {
    getCoinInfo,
    getCoinsInfo,
} from "@/utils/util";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { MarketCap } from "@/components/MarketCap";
import { formatFullNumber, formatSOL } from "@/utils/format";
import { GiThorHammer } from "react-icons/gi";
import { FaXTwitter, FaGlobe } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { calculateCurrentPrice, calculateLaunchPrice, calculateMarketCap, formatMarketCap, formatTokenGoal } from "@/utils/marketCap";
import { ImageModal } from "@/components/ImageModal";
import { ProgramProvider } from "@/contexts/ProgramProvider";
import { SOLGOAL } from "@/confgi";
import UserContext from "@/context/UserContext";
import { getTokenBalance } from "@/program/web3";
import { successAlert } from "@/components/ToastGroup";

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
    const [TargetMarketCap, setTarget] = useState(0)
    const [launchPrice, setLaunchPrice] = useState<number>(0);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [tokenBal, setTokenBal] = useState<number>(0);
    const { user } = useContext(UserContext);
    const [isBuy, setIsBuy] = useState<number>(0);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const getBalance = useCallback(async () => {
            try {
                const balance = await getTokenBalance(user.wallet, coin.token);
                setTokenBal(balance ? balance : 0);
            } catch (error) {
                setTokenBal(0);
            }
        }, [user.wallet, coin.token]);
    
        useEffect(() => {
            const interval = setInterval(() => {
                getBalance();
            }, 3000);
    
            return () => clearInterval(interval);
        }, [getBalance]);


    const shouldShowReadMore = (coin?.description?.length || 0) > 120;
    const description = isDescriptionExpanded
        ? coin?.description
        : coin?.description?.slice(0, 120) + (shouldShowReadMore ? "... " : "");
        // console.log(coin, progress)
    useEffect(() => {
        const fetchData = async () => {
            // Split the pathname and extract the last segment
            const segments = pathname.split("/");
            const parameter = segments[segments.length - 1];
            setParam(parameter);
            const data = await getCoinInfo(parameter);
            setCoin(data);
        };
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
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
            const value = Math.min(100, Math.max(0, (coin?.reserveTwo / SOLGOAL) * 100));
            setProgress(value);
            const tmc = (SOLGOAL / 1e9)
            setTarget(tmc)
            const lprice = await calculateLaunchPrice(coin?.reserveOne, coin?.reserveTwo)
            setLaunchPrice(lprice)
            const cprice = await calculateCurrentPrice(coin?.lastPrice)
            setCurrentPrice(cprice)
        };

        updateMarketCap();
        const interval = setInterval(updateMarketCap, 30000);
        return () => clearInterval(interval);
    }, [coin]);

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

    const handlTrade = () => {
        // Implement the trade logic here
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

                                                <div className="text-[#888] flex items-center">
                                                    <span 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(coin?.token || "Copied Test")
                                                                .then(() => {
                                                                    successAlert("Contract Address Copied");
                                                                })
                                                                .catch((err) => {
                                                                    console.error('Failed to copy:', err);
                                                                });
                                                        }}
                                                        className="cursor-pointer hover:text-[#01a8dd] transition-colors mr-4 flex items-center gap-1 tooltip"
                                                        title="Copy contract"
                                                    >
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            className="h-3.5 w-3.5" 
                                                            fill="none" 
                                                            viewBox="0 0 24 24" 
                                                            stroke="currentColor"
                                                        >
                                                            <path 
                                                                strokeLinecap="round" 
                                                                strokeLinejoin="round" 
                                                                strokeWidth={2} 
                                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                                                            />
                                                        </svg>
                                                        <span>CA</span>
                                                    </span>
                                                    <span>Created ago</span>
                                                </div>
                                            </div>

                                            <div className="social-links flex flex-wrap gap-4 pt-2">
                                                <button 
                                                    className="p-2 rounded-lg bg-[#1E1E1E] text-[#01a8dd]/80 hover:text-[#01a8dd] transition-colors tooltip" 
                                                    title="X/Twitter"
                                                >
                                                    <FaXTwitter size={16} />
                                                </button>
                                                <button 
                                                    className="p-2 rounded-lg bg-[#1E1E1E] text-[#01a8dd]/80 hover:text-[#01a8dd] transition-colors tooltip" 
                                                    title="Telegram"
                                                >
                                                    <FaTelegramPlane size={16} />
                                                </button>
                                                <button 
                                                    className="p-2 rounded-lg bg-[#1E1E1E] text-[#01a8dd]/80 hover:text-[#01a8dd] transition-colors tooltip" 
                                                    title="Website"
                                                >
                                                    <FaGlobe size={16} />
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
                                                    {progress.toFixed(1)}%
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
                                        <div className="text-xs text-gray-500">
                        Launch Price: {formatMarketCap(launchPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                        Current Price: {formatMarketCap(currentPrice)}
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

                            <div className="chartHolder bg-[#1a1a1a] rounded-xl p-1">
                                <TradingChart param={coin}></TradingChart>
                            </div>
                            <div className="bg-[#1a1a1a] rounded-xl p-6">
                                <Chatting param={param} coin={coin}></Chatting>
                            </div>
                        </div>

                        <div className="w-full lg:w-[32%] space-y-8 hidden lg:block">
                            <TradeForm coin={coin} tokenBal={tokenBal} user={user}/>

                            <div className="bg-[#151515] rounded-xl p-6 space-y-8">
                                <MarketCap
                                    reserveOne={coin.reserveOne}
                                    reserveTwo={coin.reserveTwo}
                                    lastPrice={coin.lastPrice}
                                />

                                <div className="space-y-4">
                                    <p className="text-sm text-[#888] leading-relaxed">
                                        When SOL Collection reaches {formatTokenGoal(TargetMarketCap)} all
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
                                        {formatSOL((coin.reserveTwo - 30e6).toString())} SOL
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
                            <TradeForm coin={coin} tokenBal={tokenBal} user={user}/>
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