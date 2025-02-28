import Coin from "../models/Coin";
import CoinStatus from "../models/CoinsStatus";
import { logger } from "../sockets/logger";
import { CandlePrice, priceFeedInfo } from "./type";

export async function fetchPriceChartData(pairIndex: number, start: number, end: number, range: number, token: string) {
  logger.info(`  fetching chart data for pairIndex: ${pairIndex}, start: ${start}, end: ${end}, range: ${range}, token: ${token}`);

  // Load price histories from DB
  const priceFeeds: priceFeedInfo[] | undefined = await Coin.findOne({ token })
    .then(async (coin) => {
      if (!coin) return undefined;
      
      const data = await CoinStatus.findOne({ coinId: coin._id }, { 'record.price': 1, 'record.time': 1 });

      if (!data || !Array.isArray(data.record)) return undefined;

      return data.record
        .map(feed => ({
          price: Number(feed.price) || 0,  // Ensure price is a number
          time: new Date(feed.time),       // Ensure time is a Date object
        })) as priceFeedInfo[];  // Explicitly typecast to match type
    });

  if (!priceFeeds || priceFeeds.length === 0) return [];

  let candlePeriod = 60; // Default 1 min
  switch (range) {
    case 5:
      candlePeriod = 300; // 5 mins
      break;
    case 15:
      candlePeriod = 1_800; // 30 mins
      break;
    case 60:
      candlePeriod = 3_600; // 1 hr
      break;
    case 120:
      candlePeriod = 7_200; // 2 hrs
      break;
  }

  // Convert price feed to candle price data
  let cdStart = Math.floor(priceFeeds[0].time.getTime() / 1000 / candlePeriod) * candlePeriod;
  let cdEnd = Math.floor(priceFeeds[priceFeeds.length - 1].time.getTime() / 1000 / candlePeriod) * candlePeriod;

  let cdFeeds: CandlePrice[] = [];
  let pIndex = 0;

  for (let curCdStart = cdStart; curCdStart <= cdEnd; curCdStart += candlePeriod) {
    let st = priceFeeds[pIndex].price;
    let hi = priceFeeds[pIndex].price;
    let lo = priceFeeds[pIndex].price;
    let en = priceFeeds[pIndex].price;
    let prevIndex = pIndex;

    for (; pIndex < priceFeeds.length; ) {
      if (hi < priceFeeds[pIndex].price) hi = priceFeeds[pIndex].price;
      if (lo > priceFeeds[pIndex].price) lo = priceFeeds[pIndex].price;
      en = priceFeeds[pIndex].price;

      if (priceFeeds[pIndex].time.getTime() / 1000 >= curCdStart + candlePeriod) break;
      pIndex++;
    }

    if (prevIndex !== pIndex) {
      cdFeeds.push({
        open: st,
        high: hi,
        low: lo,
        close: en,
        time: curCdStart,
      });
    }
  }

  return cdFeeds;
}
