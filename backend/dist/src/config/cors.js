"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sitesThatNeedAccess = [
    "https://silver-train-76jpq9p4jgcp45g-3000.app.github.dev/",
    // add others as needed
];
// const frontendUrl = "*"  // allows everything
const frontendUrl = process.env.MODE === 'local'
    // set sites available to use backend locally running or testnet
    ? ['http://localhost:3000', '*']
    // set sites available to use backend - production LIVE
    : sitesThatNeedAccess;
const corsConfig = {
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization']
};
exports.default = corsConfig;
