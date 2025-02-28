"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/Coin.js
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
const coinSchema = new mongoose_1.default.Schema({
    creator: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, },
    ticker: { type: String, required: true, },
    description: { type: String },
    token: { type: String, },
    reserveOne: { type: Number, default: config_1.totalSupply },
    reserveTwo: { type: Number, default: config_1.initialSOL },
    isMigrated: { type: Boolean, default: false },
    lastPrice: { type: String },
    url: { type: String, requried: true },
    twitter: { type: String },
    telegram: { type: String },
    website: { type: String },
    date: { type: Date, default: new Date },
    autoMigrate: { type: Boolean, default: true }
});
const Coin = mongoose_1.default.model('Coin', coinSchema);
exports.default = Coin;
