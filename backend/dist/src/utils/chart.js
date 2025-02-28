"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPriceChartData = void 0;
const Coin_1 = __importDefault(require("../models/Coin"));
const CoinsStatus_1 = __importDefault(require("../models/CoinsStatus"));
const logger_1 = require("../sockets/logger");
async function fetchPriceChartData(pairIndex, start, end, range, token) {
    logger_1.logger.info(`  fetching chart data for pairIndex: ${pairIndex}, start: ${start}, end: ${end}, range: ${range}, token: ${token}`);
    // Load price histories from DB
    const priceFeeds = await Coin_1.default.findOne({ token })
        .then(async (coin) => {
        if (!coin)
            return undefined;
        const data = await CoinsStatus_1.default.findOne({ coinId: coin._id }, { 'record.price': 1, 'record.time': 1 });
        if (!data || !Array.isArray(data.record))
            return undefined;
        return data.record
            .map(feed => ({
            price: Number(feed.price) || 0, // Ensure price is a number
            time: new Date(feed.time), // Ensure time is a Date object
        })); // Explicitly typecast to match type
    });
    if (!priceFeeds || priceFeeds.length === 0)
        return [];
    let candlePeriod = 60; // Default 1 min
    switch (range) {
        case 5:
            candlePeriod = 300; // 5 mins
            break;
        case 15:
            candlePeriod = 1800; // 30 mins
            break;
        case 60:
            candlePeriod = 3600; // 1 hr
            break;
        case 120:
            candlePeriod = 7200; // 2 hrs
            break;
    }
    // Convert price feed to candle price data
    let cdStart = Math.floor(priceFeeds[0].time.getTime() / 1000 / candlePeriod) * candlePeriod;
    let cdEnd = Math.floor(priceFeeds[priceFeeds.length - 1].time.getTime() / 1000 / candlePeriod) * candlePeriod;
    let cdFeeds = [];
    let pIndex = 0;
    for (let curCdStart = cdStart; curCdStart <= cdEnd; curCdStart += candlePeriod) {
        let st = priceFeeds[pIndex].price;
        let hi = priceFeeds[pIndex].price;
        let lo = priceFeeds[pIndex].price;
        let en = priceFeeds[pIndex].price;
        let prevIndex = pIndex;
        for (; pIndex < priceFeeds.length;) {
            if (hi < priceFeeds[pIndex].price)
                hi = priceFeeds[pIndex].price;
            if (lo > priceFeeds[pIndex].price)
                lo = priceFeeds[pIndex].price;
            en = priceFeeds[pIndex].price;
            if (priceFeeds[pIndex].time.getTime() / 1000 >= curCdStart + candlePeriod)
                break;
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
exports.fetchPriceChartData = fetchPriceChartData;
