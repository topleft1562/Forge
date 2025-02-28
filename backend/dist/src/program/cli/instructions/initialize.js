"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const web3_js_1 = require("@solana/web3.js");
const programId_1 = require("../programId");
function initialize(accounts, programId = programId_1.PROGRAM_ID) {
    const keys = [
        { pubkey: accounts.globalAccount, isSigner: false, isWritable: true },
        { pubkey: accounts.admin, isSigner: true, isWritable: true },
        { pubkey: accounts.rent, isSigner: false, isWritable: false },
        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    ];
    // ✅ Remove Fee Encoding (Rust Doesn't Expect It)
    const data = Buffer.alloc(8); // Empty data, as Rust doesn't need arguments
    const ix = new web3_js_1.TransactionInstruction({ keys, programId, data });
    return ix;
}
exports.initialize = initialize;
