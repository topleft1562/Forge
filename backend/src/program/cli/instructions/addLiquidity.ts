import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js";
import BN from "bn.js";
import * as borsh from "@coral-xyz/borsh";
import { PROGRAM_ID } from "../programId";

export interface AddLiquidityArgs {
  amountOne: BN;
  amountTwo: BN;
}

export interface AddLiquidityAccounts {
  pool: PublicKey;
  /** CHECK */
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
  borsh.u64("amountOne"),
  borsh.u64("amountTwo"),
]);

export function addLiquidity(
  args: AddLiquidityArgs,
  accounts: AddLiquidityAccounts,
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
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ];

  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      amountOne: args.amountOne,
      amountTwo: args.amountTwo,
    },
    buffer
  );
  const data = buffer.slice(0, len);

  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
