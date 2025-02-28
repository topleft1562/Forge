import { PublicKey } from "@solana/web3.js"

const programId = process.env.NEXT_PUBLIC_PROGRAM_ID ?? "5wAPQCQPif8g6PMAJJUYDxmmRbYzXSFBCHH2NsGGU5xH"

// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
export const PROGRAM_ID_IDL = new PublicKey(
  programId
)

// This constant will not get overwritten on subsequent code generations and it's safe to modify it's value.
export const PROGRAM_ID: PublicKey = PROGRAM_ID_IDL
