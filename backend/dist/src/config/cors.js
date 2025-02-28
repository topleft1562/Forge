"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const frontendUrl = "https://cautious-space-system-pqg759g6975cw95-3000.app.github.dev";
const frontendUrl = "*";
const corsConfig = {
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization']
};
exports.default = corsConfig;
