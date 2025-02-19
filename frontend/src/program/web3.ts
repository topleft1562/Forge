import { ComputeBudgetProgram, Connection, Keypair, PublicKey, SYSVAR_RENT_PUBKEY, Signer, SystemProgram, Transaction, TransactionResponse, VersionedTransaction, clusterApiUrl, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PROGRAM_ID } from "./cli/programId";
import { AccountType, TOKEN_PROGRAM_ID, getAssociatedTokenAddress , ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, getMint} from "@solana/spl-token";
import { SwapAccounts, SwapArgs, swap } from "./cli/instructions/swap";
import * as anchor from "@coral-xyz/anchor"
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { WalletContextState, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { IDL } from "./cli/idl";
import { Program } from "@coral-xyz/anchor";

const POOL_SEED_PREFIX = "liquidity_pool"

// import adminSecret from "./cli/admin.json";
// const adminKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(adminSecret));
// export const ADMIN_PUBKEY = adminKeypair.publicKey;

// ALL TESTED METHODS AND CALLS = NONE GETS RID OF THE RAW CONSTRAINT VIOLATION ON ADMIN PUBLIC KEY

//const adminKeypairData = [192,202,1,191,189,15,15,87,215,185,112,142,148,236,249,150,147,126,123,140,33,131,188,81,62,249,23,195,162,146,97,64,171,110,231,198,183,15,45,89,99,39,132,178,236,132,187,21,21,130,229,36,185,132,45,148,152,96,173,219,141,52,188,6];
//const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(adminKeypairData));

// const privateKey = base58.decode(process.env.PRIVATE_KEY!);

// export const adminKeypair = web3.Keypair.fromSecretKey(privateKey);
// const adminWallet = new NodeWallet(adminKeypair);

// Add these constants at the top of the file

// const TEST_MINT = new PublicKey("wkw1s3a2MvzgUqpba74vQL9REruUEigbXWG2oxR2nXr");
// const feeRecipientAdmin = new PublicKey("8Z7UgKvwfwtax7WjMgCGq61mNpLuJqgwY51yUgS1iAdF");

export const connection = new Connection("https://devnet.helius-rpc.com/?api-key=ae50d21e-ae63-43d3-a23f-02cd8c93098c", 'confirmed');

export const getTokenBalance = async (
  walletAddress: string,
  tokenMintAddress: string
) => {
    const wallet = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(tokenMintAddress);

    // Fetch the token account details
    const response = await connection.getTokenAccountsByOwner(wallet, {
        mint: tokenMint,
    });

    if (response.value.length == 0) {
        console.log("No token account found for the specified mint address.");
        return;
    }

    // Get the balance
    const tokenAccountInfo = await connection.getTokenAccountBalance(response.value[0].pubkey);

    // Convert the balance from integer to decimal format
    console.log(`Token Balance: ${tokenAccountInfo.value.uiAmount}`);

    return tokenAccountInfo.value.uiAmount;
}

// Swap transaction

export const swapTx = async (
  mint1: PublicKey, wallet: WalletContextState, amount: string , type: number
):Promise<any> => {
  console.log("========trade swap==============")
  if (!wallet.publicKey || !connection) {
      console.log("Warning: Wallet not connected")
      return
  }

  try {
      const provider = new anchor.AnchorProvider(connection, wallet as any, {});
      anchor.setProvider(provider);

      // Verify mint
      const mintInfo = await connection.getAccountInfo(mint1);
      if (!mintInfo) {
          console.error("Mint account does not exist");
          return;
      }
      console.log("Mint account verified:", mint1.toBase58());

      // Get PDAs
      const [poolPda] = PublicKey.findProgramAddressSync(
          [Buffer.from(POOL_SEED_PREFIX), mint1.toBuffer()],
          PROGRAM_ID
      );
      const [globalAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("global")],
          PROGRAM_ID
      );

      // Verify pool
      const poolAccount = await connection.getAccountInfo(poolPda);
      if (!poolAccount) {
          console.error("Pool does not exist");
          return;
      }
      console.log("Pool account verified:", poolPda.toBase58());

      // Get pool token account
      const poolTokenOne = await anchor.utils.token.associatedAddress({
          mint: mint1,
          owner: globalAccount
      });

      // Create pool token account
      const poolTokenAccount = await connection.getAccountInfo(poolTokenOne);
      if (!poolTokenAccount) {
          console.log("Creating pool token account...");
          await getOrCreateAssociatedTokenAccount(
              connection,
              wallet as any,
              mint1,
              globalAccount,
              true // allowOwnerOffCurve
          );
          await new Promise(resolve => setTimeout(resolve, 2000));
      }
      console.log("Pool token account verified:", poolTokenOne.toBase58());

      // Get user's token account
      const {instructions, destinationAccounts} = await getATokenAccountsNeedCreate(
          connection, 
          wallet.publicKey, 
          wallet.publicKey, 
          [mint1]
      );

      console.log(amount, "====", typeof(amount));
      const args: SwapArgs = {
          amount: new anchor.BN(type===2 ? parseFloat(amount)*1000_000_000 : parseFloat(amount)*1_000_000),
          style: new anchor.BN(type)
      };

      const ADMIN_PUBKEY = new PublicKey("8Z7UgKvwfwtax7WjMgCGq61mNpLuJqgwY51yUgS1iAdF");

      const acc: SwapAccounts = {
          pool: poolPda,
          globalAccount,
          mintTokenOne: mint1,
          poolTokenAccountOne: poolTokenOne,
          userTokenAccountOne: destinationAccounts[0],
          user: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          feeRecipient: ADMIN_PUBKEY
      };

      // Build transaction
      const dataIx = swap(args, acc, PROGRAM_ID);
      const tx = new Transaction();
      if(instructions.length !== 0) tx.add(...instructions);
      tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }));
      tx.add(dataIx);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      if (wallet.signTransaction) {
          const signedTx = await wallet.signTransaction(tx);
          const sTx = signedTx.serialize();
          console.log("----", await connection.simulateTransaction(signedTx));
          const signature = await connection.sendRawTransaction(sTx, { skipPreflight: false });
          const blockhash = await connection.getLatestBlockhash();

          const res = await connection.confirmTransaction({
              signature,
              blockhash: blockhash.blockhash,
              lastValidBlockHeight: blockhash.lastValidBlockHeight
          }, "processed");
          console.log("Successfully initialized.\n Signature: ", signature);
          return res;
      }

  } catch (error) {
      console.log("Error in swap transaction", error);
      throw error;
  }
};

const getAssociatedTokenAccount = async (
  ownerPubkey: PublicKey,
  mintPk: PublicKey
): Promise<PublicKey> => {
  let associatedTokenAccountPubkey = PublicKey.findProgramAddressSync(
    [
      ownerPubkey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mintPk.toBuffer(), // mint address
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];

  return associatedTokenAccountPubkey;
};

const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
};

const getATokenAccountsNeedCreate = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey,
  nfts: anchor.web3.PublicKey[]
) => {
  let instructions = [],
    destinationAccounts = [];
  for (const mint of nfts) {
    const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
    let response = await connection.getAccountInfo(destinationPubkey);
    if (!response) {
      const createATAIx = createAssociatedTokenAccountInstruction(
        destinationPubkey,
        walletAddress,
        owner,
        mint
      );
      instructions.push(createATAIx);
    }
    destinationAccounts.push(destinationPubkey);
    if (walletAddress != owner) {
      const userAccount = await getAssociatedTokenAccount(walletAddress, mint);
      response = await connection.getAccountInfo(userAccount);
      if (!response) {
        const createATAIx = createAssociatedTokenAccountInstruction(
          userAccount,
          walletAddress,
          walletAddress,
          mint
        );
        instructions.push(createATAIx);
      }
    }
  }
  return {
    instructions,
    destinationAccounts,
  };
};