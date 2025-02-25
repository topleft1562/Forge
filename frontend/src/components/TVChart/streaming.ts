"use client";

const USE_POLLING = false; // Set to false for production
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
      // Use the key that includes the pairIndex
      const data = queryClient.getQueryData<any>(["charts", pairIndex]);
      if (!data || !data.table || !data.table.length) return null;
      // Get the most recent bar from the table array
      const latestBar = data.table[data.table.length - 1];
      return {
        price: latestBar.close, // use the latest close price
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
    
    const subscriptionItem: SubscriptionItem = {
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
  
      const currentTime = data.time;
      // Use the updated lastBar from the subscriptionItem:
      const nextBarTime = getNextBarTime(subscriptionItem.lastBar.time, +resolution);
  
      let currentBar: Bar;
      if (currentTime >= nextBarTime) {
        // New candle should be started
        currentBar = {
          time: nextBarTime,
          open: data.price,
          high: data.price,
          low: data.price,
          close: data.price,
        };
      } else {
        // Update the ongoing candle
        currentBar = {
          ...subscriptionItem.lastBar,
          high: Math.max(subscriptionItem.lastBar.high, data.price),
          low: Math.min(subscriptionItem.lastBar.low, data.price),
          close: data.price,
        };
      }
      
      console.log("[polling] Updating bar:", currentBar);
      onRealtimeCallback(currentBar);
      // Update the subscription's lastBar
      subscriptionItem.lastBar = currentBar;
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