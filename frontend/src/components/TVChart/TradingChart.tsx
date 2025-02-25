"use client"
import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Script from "next/script";
import { ChartingLibraryWidgetOptions, ResolutionString } from "@/libraries/charting_library/charting_library";
import { coinInfo } from "@/utils/types";

interface TradingChartProps {
    param: coinInfo
}

const TVChartContainer = dynamic(
    () => import("@/components/TVChart/TVChartContainer").then((mod) => {
        // console.log("TVChartContainer module loaded");
        return mod.TVChartContainer;
    }),
    { ssr: false }
);

export const TradingChart: React.FC<TradingChartProps> = ({ param }) => {
    const [isScriptReady, setIsScriptReady] = useState(false);
    
    useEffect(() => {
        // Check if the script is already loaded
        if ((window as any).TradingView) {
           // console.log("TradingView already loaded");
            setIsScriptReady(true);
            return;
        }

        // Load the script manually if not loaded
        const script = document.createElement('script');
        script.src = '/libraries/charting_library/charting_library.standalone.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
            // console.log("TradingView script loaded manually");
            setIsScriptReady(true);
        };
        script.onerror = (error) => {
            console.error("Error loading TradingView script:", error);
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        // console.log("TradingChart effect - Script ready status:", isScriptReady);
        // console.log("TradingChart effect - Param:", param);
    }, [isScriptReady, param]);

    // Default configuration for the chart
    const defaultProps: Partial<ChartingLibraryWidgetOptions> = {
        symbol: param?.name || 'Loading...',
        interval: '15' as ResolutionString,
        library_path: '/libraries/charting_library/',
        charts_storage_url: 'https://saveload.tradingview.com',
        charts_storage_api_version: '1.1',
        client_id: 'cashfrontend.vercel.app',
        user_id: 'public_user',
        fullscreen: false,
        autosize: true,
        container: 'tv_chart_container',
        studies_overrides: {},
        theme: "light",
    };
/*
    console.log("TradingChart render - Current state:", {
        isScriptReady,
        hasParam: !!param,
        paramName: param?.name,
        hasWindow: typeof window !== 'undefined',
        hasTradingView: typeof window !== 'undefined' && !!(window as any).TradingView
    });
*/
    return (
        <div className="relative w-full h-[600px]">
            <Head>
                <title>{param?.name || 'Trading Chart'} - SolForge</title>
            </Head>
            
            {isScriptReady && param ? (
                <TVChartContainer
                    name={param.name}
                    pairIndex={10}
                    token={param.token}
                    theme="light"
                />
            ) : (
                <div className="flex items-center justify-center h-full bg-[#1E1E1E] text-white">
                    {!isScriptReady ? 'Loading TradingView library...' : 'Waiting for parameters...'}
                </div>
            )}
        </div>
    );
}