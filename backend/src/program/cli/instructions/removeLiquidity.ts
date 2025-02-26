import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface RemoveLiquidityArgs {
  isCancel: BN
}

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
export const layout = borsh.struct([
  borsh.u64("isCancel"),
])

export function removeLiquidity(
  args: RemoveLiquidityArgs,
  accounts: RemoveLiquidityAccounts,
  programId: PublicKey = PROGRAM_ID
) {
 
  // ✅ Define Account Metas
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
   // ✅ Use provided 8-byte instruction identifier
   const identifier = Buffer.from([80, 85, 209, 72, 24, 206, 177, 108]);
   const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      isCancel: args.isCancel,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  // ✅ Return Transaction Instruction
  return ix
}
