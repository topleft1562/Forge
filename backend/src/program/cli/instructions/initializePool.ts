import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js"
import { PROGRAM_ID } from "../programId"

export interface InitializePoolAccounts {
    pool: PublicKey
    mintTokenOne: PublicKey
    user: PublicKey
    systemProgram: PublicKey
}

export function initializePool(
    accounts: InitializePoolAccounts,
    programId: PublicKey = PROGRAM_ID
) {
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

    const keys: Array<AccountMeta> = [
        { pubkey: accounts.pool, isSigner: false, isWritable: true },
        { pubkey: accounts.mintTokenOne, isSigner: false, isWritable: false },
        { pubkey: accounts.user, isSigner: true, isWritable: true },
        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    ]
    
    // Anchor's discriminator for initialize_pool
    const identifier = Buffer.from([
        0x5f, 0xb4, 0x0a, 0xac, 0x54, 0xae, 0xe8, 0x28
    ])
    
    // Log the instruction data
    console.log("Initialize Pool Instruction:", {
        discriminator: identifier.toString('hex'),
        numAccounts: keys.length,
        programId: programId.toBase58()
    });

    const ix = new TransactionInstruction({ keys, programId, data: identifier })
    return ix
}