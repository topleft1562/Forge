"use client";

const USE_POLLING = true; // Set to false for production
const POLLING_INTERVAL = 5000; // 5 seconds

import type {
    Bar,
    LibrarySymbolInfo,
    ResolutionString,
    SubscribeBarsCallback,
} from "@/libraries/charting_library";

import { queryClient } from "../providers";
import { Chart } from "@/utils/types";

type SubscriptionItem = {
    subscriberUID: string;
    resolution: ResolutionString;
    lastBar: Bar;
    handlers: {
        id: string;
        callback: SubscribeBarsCallback;
    }[];
    pairIndex: number;
    pollInterval?: NodeJS.Timeout;  // Added this line to fix the type error
};

const channelToSubscription = new Map<number, SubscriptionItem>();

const pollData = async (pairIndex: number) => {
    try {
        const state = queryClient.getQueryState<Chart>(["charts"]);
        if (!state?.data) return null;
        return {
            price: state.data.closes[pairIndex] || 0,
            time: Date.now()
        };
    } catch (error) {
        console.error("[polling] Error:", error);
        return null;
    }
};

function getNextBarTime(barTime: number, resolution: number) {
    const previousSegment = Math.floor(barTime / 1000 / 60 / resolution);
    return (previousSegment + 1) * 1000 * 60 * resolution;
}

export function subscribeOnStream(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
    lastBar: Bar,
    pairIndex: number,
) {
    console.log("[polling] Setting up polling for pair index:", pairIndex);
    
    const subscriptionItem: SubscriptionItem = {  // Added type annotation here
        subscriberUID,
        resolution,
        lastBar,
        handlers: [{
            id: subscriberUID,
            callback: onRealtimeCallback,
        }],
        pairIndex,
    };
    
    const pollInterval = setInterval(async () => {
        const data = await pollData(pairIndex);
        if (!data) return;

        const currentTime = Math.floor(data.time / 1000) * 1000;
        const nextBarTime = getNextBarTime(lastBar.time, +resolution);

        let currentBar: Bar;
        if (currentTime >= nextBarTime) {
            currentBar = {
                time: nextBarTime,
                open: data.price,
                high: data.price,
                low: data.price,
                close: data.price,
            };
        } else {
            currentBar = {
                ...lastBar,
                high: Math.max(lastBar.high, data.price),
                low: Math.min(lastBar.low, data.price),
                close: data.price,
            };
        }
        
        console.log("[polling] Updating bar:", currentBar);
        onRealtimeCallback(currentBar);
    }, POLLING_INTERVAL);
    
    subscriptionItem.pollInterval = pollInterval;
    channelToSubscription.set(pairIndex, subscriptionItem);
}

export function unsubscribeFromStream(subscriberUID: string) {
    console.log("[polling] Unsubscribing from stream:", subscriberUID);
    
    for (const [pairIndex, subscriptionItem] of channelToSubscription.entries()) {
        if (subscriptionItem.subscriberUID === subscriberUID) {
            if (subscriptionItem.pollInterval) {
                clearInterval(subscriptionItem.pollInterval);
            }
            channelToSubscription.delete(pairIndex);
            console.log("[polling] Removed subscription for pair index:", pairIndex);
            break;
        }
    }
}