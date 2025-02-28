"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_cache_1 = __importDefault(require("node-cache"));
const tradeChart = {
    "s": "ok",
    "t": [1587945600, 1588032000, 1588118400],
    "o": [142.7, 144.9, 145.9],
    "h": [144.0, 145.8, 147.0],
    "l": [141.4, 142.5, 144.3],
    "c": [143.8, 144.4, 146.7],
    "v": [3285000, 3012000, 3796000]
};
const cache = new node_cache_1.default({ stdTTL: 60 });
// Mock data
const mockSymbols = {
    'ma': {
        name: 'ma',
        ticker: 'ma',
        type: 'stock',
        session: '24x7',
        timezone: 'Etc/UTC',
        // exchange: 'NASDAQ',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        intraday_multipliers: ['1', '5', '15', '60', 'D'],
        supported_resolutions: ['1', '5', '15', '60', 'D'],
        volume_precision: 2,
    },
};
const mockHistory = {
    'ma': {
        s: 'ok',
        t: [1587945600, 1588032000, 1588118400],
        o: [142.7, 144.9, 145.9],
        h: [144.0, 145.8, 147.0],
        l: [141.4, 142.5, 144.3],
        c: [143.8, 144.4, 146.7],
        v: [3285000, 3012000, 3796000],
    },
};
const config = {
    s: 'ok',
    t: [1587945600, 1588032000, 1588118400],
    o: [142.7, 144.9, 145.9],
    h: [144.0, 145.8, 147.0],
    l: [141.4, 142.5, 144.3],
    c: [143.8, 144.4, 146.7],
    v: [3285000, 3012000, 3796000],
};
const router = express_1.default.Router();
router.get('/', (req, res) => {
    console.log("config+++");
    res.json(config);
});
// @route   GET /coin/
// @desc    Get all created coins
// @access  Public
router.get('/config', (req, res) => {
    console.log("config+++");
    const config = {
        supports_search: true,
        supports_group_request: false,
        supported_resolutions: ['1', '5', '15', '60', 'D'],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
    };
    res.json(config);
});
router.get('/symbols', (req, res) => {
    const symbol = req.query.symbol;
    let symbolStr = "";
    console.log("symbols;;;;;", symbol);
    if (typeof symbol === 'string') {
        symbolStr = symbol;
    }
    else if (Array.isArray(symbol) && symbol.length > 0) {
        symbolStr = symbol[0].toString();
    }
    else if (typeof symbol === 'object' && symbol !== null) {
        symbolStr = Object.values(symbol).join('');
    }
    else {
        console.error('Invalid symbol format');
    }
    const symbolInfo = mockSymbols[symbolStr];
    console.log("symbol::++++:::", symbolInfo);
    if (symbolInfo) {
        res.json(symbolInfo);
    }
    else {
        res.status(404).json({ error: 'Symbol not found' });
    }
});
router.get('/history', (req, res) => {
    const { symbol, resolution, from, to } = req.query;
    console.log("req.query;;;;;", req.query);
    let symbolStr = "";
    const cacheKey = `${symbol}-${resolution}-${from}-${to}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        console.log('Serving from cache:', cacheKey);
        return res.json(cachedData);
    }
    if (typeof symbol === 'string') {
        symbolStr = symbol;
    }
    else if (Array.isArray(symbol) && symbol.length > 0) {
        symbolStr = symbol[0].toString();
    }
    else if (typeof symbol === 'object' && symbol !== null) {
        symbolStr = Object.values(symbol).join('');
    }
    else {
        console.error('Invalid symbol format');
    }
    const history = mockHistory[symbolStr];
    console.log("history::::", history);
    if (history) {
        return res.json(history);
    }
    else {
        return res.status(404).json({ s: 'error', error: 'No data' });
    }
});
router.get('/search', (req, res) => {
    const query = req.query.query;
    if (query == undefined)
        return res.status(400).json("failed");
    const results = Object.keys(mockSymbols)
        .filter(symbol => {
        // Handle the query based on its type
        let queryString;
        if (typeof query === 'string') {
            queryString = query;
        }
        else if (Array.isArray(query)) {
            queryString = query.join(' ').toUpperCase();
        }
        else if (typeof query === 'object' && query !== null) {
            // Convert ParsedQs or ParsedQs[] to a string representation
            queryString = Object.values(query).join(' ').toUpperCase();
        }
        else {
            queryString = ''; // Handle other cases as needed
        }
        return symbol.includes(queryString);
    })
        .map(symbol => ({
        symbol,
        full_name: symbol,
        description: `Description of ${symbol}`,
        exchange: 'NASDAQ',
        ticker: symbol,
        type: 'stock',
    }));
    res.json(results);
});
exports.default = router;
function calculateOHLCV(trades, periodStart, periodEnd) {
    let open = 0;
    let high = -Infinity;
    let low = Infinity;
    let close = 0;
    let volume = 0;
    if (trades.length > 0) {
        open = trades[0].price; // Initial open
        close = trades[trades.length - 1].price; // Final close
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            volume += trade.amount;
            if (trade.price > high)
                high = trade.price;
            if (trade.price < low)
                low = trade.price;
        }
    }
    return {
        time: periodStart,
        open,
        high,
        low,
        close,
        volume,
    };
}
