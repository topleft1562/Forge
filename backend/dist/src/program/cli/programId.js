"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROGRAM_ID = exports.PROGRAM_ID_IDL = void 0;
const web3_js_1 = require("@solana/web3.js");
// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
exports.PROGRAM_ID_IDL = new web3_js_1.PublicKey("5wAPQCQPif8g6PMAJJUYDxmmRbYzXSFBCHH2NsGGU5xH");
// This constant will not get overwritten on subsequent code generations and it's safe to modify it's value.
exports.PROGRAM_ID = exports.PROGRAM_ID_IDL;
