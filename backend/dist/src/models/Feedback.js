"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/Coin.js
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    coinId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'coin', required: true },
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user', required: true },
    msg: { type: String, required: true },
    time: { type: Date, default: Date.now }
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports.default = Message;
