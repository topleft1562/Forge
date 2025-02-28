"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/PendingUser.js
const mongoose_1 = __importDefault(require("mongoose"));
const pendingUserSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, },
    wallet: { type: String, required: true, },
    nonce: { type: String, required: true },
    isLedger: { type: Boolean, required: true },
    expiredTime: { type: Date, expires: '20m', default: Date.now }
});
const PendingUser = mongoose_1.default.model('PendingUser', pendingUserSchema);
exports.default = PendingUser;
