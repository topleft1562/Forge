"use client";

import type {
  Bar,
  LibrarySymbolInfo,
  IBasicDataFeed,
  DatafeedConfiguration,
  ResolutionString,
} from "@/libraries/charting_library";
import { getChartTable } from "@/utils/getChartTable";
import { subscribeOnStream, unsubscribeFromStream } from "./streaming";

const historyCache = new Map<string, Bar[]>();
let lastApiCall: number | null = null;

const lastBarsCache = new Map<string, Bar>();

const configurationData: DatafeedConfiguration = {
  supported_resolutions: [
    "1",
    "5",
    "15",
    "45",
    "60",
    "240",
    "1D",
  ] as ResolutionString[],
  exchanges: [],
  symbols_types: [{
    name: 'crypto',
    value: 'crypto'
  }]
};

export function getDataFeed({
  pairIndex,
  name,
  token
}: {
  name: string;
  pairIndex: number;
  token: string
}): IBasicDataFeed {
  return {
    onReady: (callback) => {
      console.log("[datafeed] onReady called");
      setTimeout(() => {
        console.log("[datafeed] Calling onReady callback with:", configurationData);
        callback(configurationData);
      });
    },

    searchSymbols: (userInput, exchange, symbolType, onResult) => {
      console.log("[datafeed] searchSymbols called");
      onResult([]);
    },

    resolveSymbol: async (
      symbolName,
      onSymbolResolvedCallback,
      onResolveErrorCallback,
  ) => {
      console.log("[datafeed] resolveSymbol called for:", symbolName);
      try {
          const symbolInfo: LibrarySymbolInfo = {
              ticker: name,
              name: name,
              description: name,
              type: "crypto",
              session: "24x7",
              timezone: "Etc/UTC",
              minmov: 1,  // Only defined once
              pricescale: 1000000000000,
              has_intraday: true,
              visible_plots_set: 'ohlc',
              has_weekly_and_monthly: false,
              supported_resolutions: configurationData.supported_resolutions,
              volume_precision: 8,
              data_status: "streaming",
              format: "price",
              exchange: "",
              listed_exchange: ""
          };
  
          console.log("[datafeed] Symbol resolved:", symbolInfo);
          onSymbolResolvedCallback(symbolInfo);
      } catch (error) {
          console.error("[datafeed] Symbol resolution error:", error);
          onResolveErrorCallback('Error resolving symbol');
      }
  },

    getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback,
  ) => {
      const { from, to, firstDataRequest } = periodParams;
      
      // Add a cache for historical data
      const cacheKey = `${symbolInfo.name}-${resolution}-${from}-${to}`;
      const cachedData = historyCache.get(cacheKey);
      
      if (cachedData) {
          console.log("[datafeed] Returning cached data for:", cacheKey);
          onHistoryCallback(cachedData, { noData: false });
          return;
      }
  
      console.log("[datafeed] getBars called:", {
          symbol: symbolInfo.name,
          resolution,
          from,
          to,
          firstDataRequest
      });
  
      try {
          // Add debounce/throttle for API calls
          if (lastApiCall && Date.now() - lastApiCall < 1000) {
              console.log("[datafeed] Throttling API call");
              onHistoryCallback([], { noData: true });
              return;
          }
          lastApiCall = Date.now();
  
          const chartTable = await getChartTable({
              token,
              pairIndex,
              from,
              to,
              range: resolution === '1D' ? 1440 : +resolution,
          });
  
          if (!chartTable?.table?.length) {
              console.log("[datafeed] No data available");
              onHistoryCallback([], { noData: true });
              return;
          }
  
          const bars: Bar[] = chartTable.table.map((bar: Bar) => ({
              ...bar,
              time: bar.time * 1000
          }));
  
          if (bars.length > 0) {
              lastBarsCache.set(symbolInfo.name, bars[bars.length - 1]);
              // Cache the historical data
              historyCache.set(cacheKey, bars);
          }
  
          console.log("[datafeed] Sending bars to chart:", bars.length);
          onHistoryCallback(bars, { noData: false });
      } catch (error) {
          console.error("[datafeed] getBars error:", error);
          onErrorCallback(error);
      }
  },

    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
    ) => {
      console.log("[datafeed] subscribeBars called:", {
        symbol: symbolInfo.name,
        resolution,
        subscriberUID
      });

      const lastBar = lastBarsCache.get(symbolInfo.name);
      if (!lastBar) {
        console.error('[datafeed] No last bar found for subscription');
        return;
      }

      subscribeOnStream(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
        lastBar,
        pairIndex,
      );
    },

    unsubscribeBars: (subscriberUID) => {
      console.log("[datafeed] unsubscribeBars:", subscriberUID);
      unsubscribeFromStream(subscriberUID);
    },
  };
}