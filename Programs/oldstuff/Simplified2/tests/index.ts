import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import type { Consts } from "../target/types/consts";

describe("Initialize Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Consts as anchor.Program<Consts>;
  
  // ✅ Set up the Anchor provider
  // anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Pump;
    const provider = anchor.getProvider();
    const payer = (anchor.AnchorProvider.env().wallet as anchor.Wallet).payer;

  let globalAccount: PublicKey;

  before(async () => {
    console.log("🔹 Deriving PDA for Global Account...");
    
    // ✅ Derive the PDA for the `globalAccount`
    [globalAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      program.programId
    );

    console.log("✅ Global Account PDA:", globalAccount.toBase58());
  });

  it("Initialize Global Account", async () => {
    console.log("🔹 Sending Initialize Transaction...");

    // ✅ Execute the `initialize` instruction
    const tx = await program.methods
      .initialize()
      .accounts({
        globalAccount,
        admin: payer,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    console.log("✅ Initialize Transaction Signature:", tx);
    console.log(`🔍 Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // ✅ Fetch account to verify it exists
    const accountInfo = await provider.connection.getAccountInfo(globalAccount);
    if (accountInfo) {
      console.log("✅ Global Account Successfully Initialized!");
    } else {
      console.error("❌ Global Account Not Found!");
    }
  });
});
