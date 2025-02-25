"use client"
import { useContext, useEffect, useRef } from "react";
import { 
    ChartingLibraryWidgetOptions, 
    IChartingLibraryWidget, 
    ResolutionString, 
    widget,
    StudyOverrides 
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
    theme?: 'light' | 'dark';
};

export const TVChartContainer = ({
    name,
    pairIndex,
    token,
    theme = 'dark'
}: TVChartContainerProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
    const {isLoading, setIsLoading} = useContext(UserContext);

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
                    backgroundColor: '#141414',
                    foregroundColor: '#E0FFFF',
                },
                custom_css_url: 'data:text/css;base64,' + btoa(`
                    .theme-dark:root {
                        --tv-color-platform-background: #141414;
                        --tv-color-pane-background: #141414;
                        --tv-color-pane-background-secondary: #141414;
                        --tv-color-toolbar-button-background-hover: #141414;
                        --tv-color-toolbar-button-background-secondary-hover: #141414;
                        --tv-color-toolbar-button-background-expanded: #141414;
                        --tv-color-toolbar-button-text: #888888;
                        --tv-color-toolbar-button-text-hover: #888888;
                        --tv-color-toolbar-divider-background: #141414;
                    }
                    .chart-page .chart-container-border {
                        background-color: #141414;
                    }
                    .chart-page {
                        background-color: #141414;
                    }
                    .group-2JyOhh7Z {
                        background-color: #141414 !important;
                    }
                `),
                overrides: {
                    // Bullish (Up) candles - blue shades
                    'mainSeriesProperties.candleStyle.upColor': '#59bbf3',      // Bullish body
                    'mainSeriesProperties.candleStyle.wickUpColor': '#59bbf3',  // Bullish wick
                    'mainSeriesProperties.candleStyle.borderUpColor': '#3B6A93',// Bullish border
                    
                    // Bearish (Down) candles - light shades
                    'mainSeriesProperties.candleStyle.downColor': '#E0FFFF',    // Bearish body
                    'mainSeriesProperties.candleStyle.wickDownColor': '#E0FFFF',// Bearish wick
                    'mainSeriesProperties.candleStyle.borderDownColor': '#C0D9D9',// Bearish border
                    
                    // Background colors
                    'paneProperties.background': '#141414',
                    'paneProperties.backgroundType': 'solid',
                    'chartProperties.background': '#141414',
                    'chartProperties.backgroundType': 'solid',
                    
                    // Toolbar/Header colors
                    'toolbarProperties.backgroundColor': '#141414',
                    'toolbarProperties.backgroundColorDisabled': '#141414',
                    'toolbarProperties.backgroundColorActive': '#141414',
                    'toolbarProperties.borderColor': '#141414',
                    
                    // Grid and scale colors
                    'paneProperties.vertGridProperties.color': '#1E1E1E',
                    'paneProperties.horzGridProperties.color': '#1E1E1E',
                    'scalesProperties.textColor': '#888888',
                    'scalesProperties.lineColor': '#888888',
                    'scalesProperties.backgroundColor': '#141414',
                    
                    // Expanded toolbar/header colors
                    'mainSeriesProperties.statusViewStyle.backgroundColor': '#141414',
                    'mainSeriesProperties.statusViewStyle.textColor': '#888888',
                    'symbolWatermarkProperties.color': '#888888',
                    'mainSeriesProperties.style': 1,
                    'mainSeriesProperties.statusViewStyle.symbolTextSource': 'ticker',
                    'mainSeriesProperties.statusViewStyle.priceSource': 'close',
                    'headerProperties.background': '#141414',
                    'headerProperties.backgroundColor': '#141414',
                    'headerProperties.backgroundColorActive': '#141414',
                    'headerProperties.backgroundColorHover': '#141414',
                    'headerProperties.borderColor': '#141414',
                    'paneProperties.topMargin': 8,
                    'topToolbar.backgroundColor': '#141414',
                    'topToolbar.backgroundColorActive': '#141414',
                    'topToolbar.backgroundColorHover': '#141414',
                    'topToolbar.borderColor': '#141414',
                    
                    // Text colors
                    'scalesProperties.textColor': '#888888',
                    'scalesProperties.lineColor': '#888888',
                    'mainSeriesProperties.statusViewStyle.textColor': '#888888',
                    
                    // Additional text color properties
                    'symbolWatermarkProperties.color': '#888888',
                    'chartProperties.textColor': '#888888',
                    'headerProperties.textColor': '#888888',
                    'headerProperties.symbolTextColor': '#888888',
                    'headerProperties.symbolDescriptionTextColor': '#888888',
                    'paneProperties.legendProperties.textColor': '#888888',
                    'paneProperties.crossHairProperties.color': '#888888',
                    'paneProperties.crossHairProperties.labelBackgroundColor': '#141414',
                    'paneProperties.crossHairProperties.labelTextColor': '#888888',

                    // More specific toolbar styling
                    'toolbar.background': '#141414',
                    'toolbar.backgroundColor': '#141414',
                    'toolbar.backgroundGradient.color1': '#141414',
                    'toolbar.backgroundGradient.color2': '#141414',
                    'toolbar.separator': '#141414',
                    'toolbar.border': '#141414',
                    
                    // Chart top toolbar
                    'chartTopToolbar.background': '#141414',
                    'chartTopToolbar.backgroundColor': '#141414',
                    'chartTopToolbar.backgroundGradient.color1': '#141414',
                    'chartTopToolbar.backgroundGradient.color2': '#141414',
                    'chartTopToolbar.separator': '#141414',
                    'chartTopToolbar.border': '#141414',
                    
                    // General header
                    'header.background': '#141414',
                    'header.backgroundColor': '#141414',
                    'header.backgroundGradient.color1': '#141414',
                    'header.backgroundGradient.color2': '#141414',
                    'header.separator': '#141414',
                    'header.border': '#141414',
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
                
                // Temporarily disable MA indicators until we fix the type issues
                /*
                chart?.createStudy(
                    'Moving Average', 
                    false, 
                    false, 
                    [7], 
                    { 'plot.color': '#2962FF' }
                );
                
                chart?.createStudy(
                    'Moving Average', 
                    false, 
                    false, 
                    [25], 
                    { 'plot.color': '#FF6D00' }
                );
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
    }, [name, pairIndex, token, setIsLoading, theme]);

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
            <div
                ref={chartContainerRef}
                className={twMerge("h-full w-full")}
            />
        </div>
    );
};