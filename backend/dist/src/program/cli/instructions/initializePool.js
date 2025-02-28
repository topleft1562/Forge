"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePool = void 0;
const web3_js_1 = require("@solana/web3.js");
const programId_1 = require("../programId");
function initializePool(accounts, programId = programId_1.PROGRAM_ID) {
    // Validate accounts
    if (!accounts.pool || !accounts.mintTokenOne || !accounts.user || !accounts.systemProgram) {
        throw new Error("Missing required accounts for initialize_pool");
    }
    // Log the accounts being used
    console.log("Initialize Pool Accounts:", {
        pool: accounts.pool.toBase58(),
        mintTokenOne: accounts.mintTokenOne.toBase58(),
        user: accounts.user.toBase58(),
        systemProgram: accounts.systemProgram.toBase58(),
        programId: programId.toBase58()
    });
    const keys = [
        { pubkey: accounts.pool, isSigner: false, isWritable: true },
        { pubkey: accounts.mintTokenOne, isSigner: false, isWritable: true },
        { pubkey: accounts.user, isSigner: true, isWritable: true },
        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    ];
    // Anchor's discriminator for initialize_pool
    const identifier = Buffer.from([
        0x5f, 0xb4, 0x0a, 0xac, 0x54, 0xae, 0xe8, 0x28
    ]);
    // Log the instruction data
    console.log("Initialize Pool Instruction:", {
        discriminator: identifier.toString('hex'),
        numAccounts: keys.length,
        programId: programId.toBase58()
    });
    const ix = new web3_js_1.TransactionInstruction({ keys, programId, data: identifier });
    return ix;
}
exports.initializePool = initializePool;
