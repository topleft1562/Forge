import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js";
import { PROGRAM_ID } from "../programId";

export interface InitializeAccounts {
  /** CHECK */
  globalAccount: PublicKey;
  admin: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export function initialize(
  accounts: InitializeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.globalAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];

  // ✅ Remove Fee Encoding (Rust Doesn't Expect It)
  const data = Buffer.alloc(8); // Empty data, as Rust doesn't need arguments

  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
