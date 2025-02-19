import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js";
import { PROGRAM_ID } from "../programId";

export interface RemoveLiquidityAccounts {
  pool: PublicKey;
  globalAccount: PublicKey;
  mintTokenOne: PublicKey;
  poolTokenAccountOne: PublicKey;
  userTokenAccountOne: PublicKey;
  user: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
}

export function removeLiquidity(
  accounts: RemoveLiquidityAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.globalAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.mintTokenOne, isSigner: false, isWritable: true },
    { pubkey: accounts.poolTokenAccountOne, isSigner: false, isWritable: true },
    { pubkey: accounts.userTokenAccountOne, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.associatedTokenProgram, isSigner: false, isWritable: false },
  ];

  const data = Buffer.alloc(0);

  return new TransactionInstruction({ keys, programId, data });
}
