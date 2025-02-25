"use client"
import { useContext, useEffect, useRef } from "react";
import { 
    ChartingLibraryWidgetOptions, 
    IChartingLibraryWidget, 
    ResolutionString, 
    widget,
} from "@/libraries/charting_library";
import ReactLoading from "react-loading";
import { twMerge } from "tailwind-merge";
import UserContext from "@/context/UserContext";
import { getDataFeed } from "./datafeed";

export type TVChartContainerProps = {
    name: string;
    pairIndex: number;
    token: string;
    classNames?: {
        container: string;
    };
};

export const TVChartContainer = ({
    name,
    pairIndex,
    token
}: TVChartContainerProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
    const { isLoading, setIsLoading } = useContext(UserContext);

    useEffect(() => {
        console.log("Effect triggered:", { name, pairIndex, token });
        if (!chartContainerRef.current || !name) {
            console.log("Missing requirements:", { 
                hasContainer: !!chartContainerRef.current, 
                hasName: !!name 
            });
            return;
        }

        const initChart = async () => {
            console.log("Initializing chart...");
            if (tvWidgetRef.current) {
                console.log("Removing existing widget");
                tvWidgetRef.current.remove();
            }

            const widgetOptions: ChartingLibraryWidgetOptions = {
                symbol: name,
                interval: '15' as ResolutionString,
                container: chartContainerRef.current!,
                library_path: '/libraries/charting_library/',
                locale: 'en',
                disabled_features: [
                    'use_localstorage_for_settings',
                    'volume_force_overlay',
                    'left_toolbar',
                    'context_menus',
                    'control_bar',
                    'timeframes_toolbar',
                ],
                enabled_features: [
                    'study_templates',
                    'create_volume_indicator_by_default',
                ],
                charts_storage_url: 'https://saveload.tradingview.com',
                charts_storage_api_version: '1.1',
                client_id: 'cashfrontend.vercel.app',
                user_id: 'public_user',
                fullscreen: false,
                autosize: true,
                studies_overrides: {},
                theme: 'dark',
                loading_screen: {
                    backgroundColor: '#1E1E1E',
                    foregroundColor: '#1E1E1E',
                },
                // Overrides for both Candle and Area styles.
                overrides: {
                    // Candle style (works as before)
                    'mainSeriesProperties.candleStyle.upColor': '#26a69a',
                    'mainSeriesProperties.candleStyle.downColor': '#ef5350',
                    'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
                    'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
                    'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
                    'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
                    // Area style overrides using rgba values.
                    'mainSeriesProperties.areaStyle.color1': 'rgba(38, 166, 154, 0.2)',
                    'mainSeriesProperties.areaStyle.color2': 'rgba(38, 166, 154, 0.2)',
                    'mainSeriesProperties.areaStyle.linecolor': 'rgba(38, 166, 154, 1)',
                    'mainSeriesProperties.areaStyle.linewidth': 2,
                },
                datafeed: getDataFeed({ 
                    pairIndex, 
                    name, 
                    token
                }),
            };

            console.log("Creating widget with options:", widgetOptions);
            tvWidgetRef.current = new widget(widgetOptions);
            console.log("Widget created");

            tvWidgetRef.current.onChartReady(() => {
                console.log("Chart is ready");
                setIsLoading(false);
                const chart = tvWidgetRef.current?.activeChart();
                const priceScale = chart?.getPanes()[0].getMainSourcePriceScale();
                priceScale?.setAutoScale(true);
                
                // Force the chart to use the Area style.
                // Uncomment the block below to force the chart type after a short delay.
                /*
                setTimeout(() => {
                    // Change the chart type. (The value 1 is assumed to be Area in your library version.)
                    chart?.setChartType(1);
                    chart?.reloadData();
                }, 100);
                */
            });
        };

        initChart().catch(error => {
            console.error("Chart initialization failed:", error);
        });

        return () => {
            if (tvWidgetRef.current) {
                tvWidgetRef.current.remove();
            }
        };
    }, [name, pairIndex, token, setIsLoading]);

    return (
        <div className="relative mb-[1px] h-[500px] w-full">
            {isLoading && (
                <div className="z-50 absolute left-0 top-0 flex h-full w-full items-center justify-center bg-[#1E1E1E]">
                    <ReactLoading
                        height={20}
                        width={50}
                        type="bars"
                        color="#36d7b7"
                    />
                </div>
            )}
            <div ref={chartContainerRef} className="h-full w-full" />
        </div>
    );
};
