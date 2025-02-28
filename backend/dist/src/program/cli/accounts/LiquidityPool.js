"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityPool = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js")); // eslint-disable-line @typescript-eslint/no-unused-vars
const borsh = __importStar(require("@coral-xyz/borsh")); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
class LiquidityPool {
    constructor(fields) {
        this.tokenOne = fields.tokenOne;
        this.tokenTwo = fields.tokenTwo;
        this.totalSupply = fields.totalSupply;
        this.reserveOne = fields.reserveOne;
        this.reserveTwo = fields.reserveTwo;
        this.bump = fields.bump;
    }
    static async fetch(c, address, programId = programId_1.PROGRAM_ID) {
        const info = await c.getAccountInfo(address);
        if (info === null) {
            return null;
        }
        if (!info.owner.equals(programId)) {
            throw new Error("account doesn't belong to this program");
        }
        return this.decode(info.data);
    }
    static async fetchMultiple(c, addresses, programId = programId_1.PROGRAM_ID) {
        const infos = await c.getMultipleAccountsInfo(addresses);
        return infos.map((info) => {
            if (info === null) {
                return null;
            }
            if (!info.owner.equals(programId)) {
                throw new Error("account doesn't belong to this program");
            }
            return this.decode(info.data);
        });
    }
    static decode(data) {
        if (!data.slice(0, 8).equals(LiquidityPool.discriminator)) {
            throw new Error("invalid account discriminator");
        }
        const dec = LiquidityPool.layout.decode(data.slice(8));
        return new LiquidityPool({
            tokenOne: dec.tokenOne,
            tokenTwo: dec.tokenTwo,
            totalSupply: dec.totalSupply,
            reserveOne: dec.reserveOne,
            reserveTwo: dec.reserveTwo,
            bump: dec.bump,
        });
    }
    toJSON() {
        return {
            tokenOne: this.tokenOne.toString(),
            tokenTwo: this.tokenTwo.toString(),
            totalSupply: this.totalSupply.toString(),
            reserveOne: this.reserveOne.toString(),
            reserveTwo: this.reserveTwo.toString(),
            bump: this.bump,
        };
    }
    static fromJSON(obj) {
        return new LiquidityPool({
            tokenOne: new web3_js_1.PublicKey(obj.tokenOne),
            tokenTwo: new web3_js_1.PublicKey(obj.tokenTwo),
            totalSupply: new bn_js_1.default(obj.totalSupply),
            reserveOne: new bn_js_1.default(obj.reserveOne),
            reserveTwo: new bn_js_1.default(obj.reserveTwo),
            bump: obj.bump,
        });
    }
}
exports.LiquidityPool = LiquidityPool;
LiquidityPool.discriminator = Buffer.from([
    66, 38, 17, 64, 188, 80, 68, 129,
]);
LiquidityPool.layout = borsh.struct([
    borsh.publicKey("tokenOne"),
    borsh.publicKey("tokenTwo"),
    borsh.u64("totalSupply"),
    borsh.u64("reserveOne"),
    borsh.u64("reserveTwo"),
    borsh.u8("bump"),
]);
