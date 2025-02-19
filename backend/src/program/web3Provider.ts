import * as anchor from "@coral-xyz/anchor"
import { PROGRAM_ID } from "./cli/programId"
import { ComputeBudgetProgram, Connection, PublicKey, Keypair, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction, } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync, } from "@solana/spl-token"
import { AddLiquidityAccounts, AddLiquidityArgs, InitializeAccounts, InitializeArgs, InitializePoolAccounts, RemoveLiquidityAccounts, RemoveLiquidityArgs, SwapAccounts, SwapArgs, addLiquidity, initialize, initializePool, removeLiquidity, swap } from "./cli/instructions"
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token"
import {
  MarketV2,
  Liquidity,
  Token,
  DEVNET_PROGRAM_ID,
  TxVersion,
  LOOKUP_TABLE_CACHE,
  buildSimpleTransaction,
  Spl,
  parseBigNumberish,
  InstructionType
} from '@raydium-io/raydium-sdk';
import { adminKeypair } from "./web3"


// mainnet  const RAYDIUM_AMM_PROGRAM_ID = new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C");
const RAYDIUM_AMM_PROGRAM_ID = new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW");
const POOL_SEED_PREFIX = "liquidity_pool"



export const createLPIx = async (
  mintToken: PublicKey,
  payer: PublicKey,
) => {
  console.log("Starting createLPIx with:", {
    mintToken: mintToken.toBase58(),
    payer: payer.toBase58()
  });

  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_SEED_PREFIX), mintToken.toBuffer()],
    PROGRAM_ID
  );
  // console.log("Pool PDA:", poolPda.toBase58());

  const [globalAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    PROGRAM_ID
  );
  // console.log("Global Account:", globalAccount.toBase58());

  const poolTokenOne = await getAssociatedTokenAddress(
    mintToken, globalAccount, true
  );
  // console.log("Pool Token Account:", poolTokenOne.toBase58());

  const userAta1 = await getAssociatedTokenAddress(
    mintToken, payer
  );
  // console.log("User ATA:", userAta1.toBase58());

  const acc: AddLiquidityAccounts = {
    pool: poolPda,
    globalAccount,
    mintTokenOne: mintToken,
    poolTokenAccountOne: poolTokenOne,
    userTokenAccountOne: userAta1,
    user: payer,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    systemProgram: SystemProgram.programId
  };
  
  console.log("AddLiquidity Accounts:", {
    ...acc,
    pool: acc.pool.toBase58(),
    globalAccount: acc.globalAccount.toBase58(),
    mintTokenOne: acc.mintTokenOne.toBase58(),
    poolTokenAccountOne: acc.poolTokenAccountOne.toBase58(),
    userTokenAccountOne: acc.userTokenAccountOne.toBase58(),
    user: acc.user.toBase58(),
  });

  const args: AddLiquidityArgs = {
    amountOne: new anchor.BN(1000000000000000),
    amountTwo: new anchor.BN(30000000)
  };
  console.log("AddLiquidity Args:", {
    amountOne: args.amountOne.toString(),
    amountTwo: args.amountTwo.toString()
  });

  const ix = addLiquidity(args, acc);
  // console.log("AddLiquidity instruction created");

  return { ix, acc }
}

export const initializeIx = async (
  payer: PublicKey
) => {
  console.log("Starting initializeIx with payer:", payer.toBase58());

  const [globalAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    PROGRAM_ID
  );
  // console.log("Global Account:", globalAccount.toBase58());

  const acc: InitializeAccounts = {
    globalAccount,
    admin: payer,
    rent: SYSVAR_RENT_PUBKEY,
    systemProgram: SystemProgram.programId
  };
  /*
  console.log("Initialize Accounts:", {
    globalAccount: acc.globalAccount.toBase58(),
    admin: acc.admin.toBase58(),
  });
*/
  const ix = initialize(acc);
  // console.log("Initialize instruction created");

  return { ix, acc }
}

// Add a new function for pool initialization
export const initializePoolIx = async (
  mintToken: PublicKey,
  payer: PublicKey
) => {
  /*
  console.log("Starting initializePoolIx with:", {
    mintToken: mintToken.toBase58(),
    payer: payer.toBase58()
  });
*/
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity_pool"), mintToken.toBuffer()],
    PROGRAM_ID
  );
  console.log("Pool PDA:", poolPda.toBase58());

  const acc: InitializePoolAccounts = {
    pool: poolPda,
    mintTokenOne: mintToken,
    user: payer,
    systemProgram: SystemProgram.programId
  };

  const ix = initializePool(acc);
  // console.log("Pool initialization instruction created");

  return { ix, acc };
};



// export const performTx = async (
//     address: string,
//     txId: string,
// ) => {
//     try{
//         console.log("==============")

//         let txInfo;
//         for(let i=0; ; i++) {
//             await sleep(2000)
//             txInfo = await getDataFromSignature(txId, io); 

//             console.log(txInfo)
//             if (txInfo !== undefined) {
//                 break;
//             }
//             if (i > 30) {
//                 io.emit("performedTx", address, "Time Out");
//                 return;
//             }
//         }

//     } catch (err) {

//     }

// }


// const getDataFromSignature = async (sig: string, io: Server) => {

//     try {
//         let tx = await connection.getParsedTransaction(sig,'confirmed');
//         if (tx && tx.meta && !tx.meta.err) {   
//             let length = tx.transaction.message.instructions.length;

//             for (let i = length; i > 0; i--) {
//                     const ix = tx.transaction.message.instructions[i-1]  as ParsedInstruction

//                     if (ix.programId.toBase58() === SPL_TOKEN_PROGRAM ) {
//                         console.log(ix, " =============> ix")
//                         const srcAcc = await connection.getParsedAccountInfo(new PublicKey(ix.parsed.info.source));
//                         const destAcc = await connection.getParsedAccountInfo(new PublicKey(ix.parsed.info.destination));
//                         const src = (srcAcc.value?.data as ParsedAccountData).parsed.info.owner;
//                         const dest = (destAcc.value?.data as ParsedAccountData).parsed.info.owner;
//                         const amount = parseInt(ix.parsed.info.amount);


//                         break;
//                     }

//             }

//             return true;

//         }

//     } catch (error) {
//         console.log("error:", error)
//     }
// }

// export const createAddLPIx = (
//     mintTokenOne: PublicKey,
//     mintTokenTwo: PublicKey,
//     payer: PublicKey,
//     amountOne: anchor.BN,
//     amountTwo: anchor.BN
// ) => {
//     const [poolPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("liquidity_pool"), Buffer.from(mintTokenOne > mintTokenTwo ? mintTokenOne.toBase58()+mintTokenTwo.toBase58() :  mintTokenTwo.toBase58()+mintTokenOne.toBase58()) ],
//         PROGRAM_ID
//     )

//     const [liquidityProviderAccount] = PublicKey.findProgramAddressSync(
//         [Buffer.from("LiqudityProvider"), poolPda.toBuffer(), payer.toBuffer()],
//         PROGRAM_ID
//     )

//     const poolTokenAccountOne = getAssociatedTokenAddressSync(mintTokenOne, poolPda); 
//     const poolTokenAccountTwo = getAssociatedTokenAddressSync(mintTokenOne, poolPda); 
//     const userTokenAccountOne = getAssociatedTokenAddressSync(mintTokenOne, payer); 
//     const userTokenAccountTwo = getAssociatedTokenAddressSync(mintTokenOne, payer); 

//     const acc: AddLiquidityAccounts = {
//         pool: poolPda,
//         liquidityProviderAccount,
//         mintTokenOne,
//         mintTokenTwo,
//         poolTokenAccountOne,
//         poolTokenAccountTwo,
//         userTokenAccountOne,
//         userTokenAccountTwo,
//         user: payer,
//         systemProgram: SystemProgram.programId,
//         tokenProgram:TOKEN_PROGRAM_ID,
//         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
//     }

//     const args: AddLiquidityArgs = {
//         amountOne,
//         amountTwo
//     }
//     const ix = addLiquidity(args, acc);

//     return {ix, acc}
// }

// export const createRemoveLPIx = (
//     mintTokenOne: PublicKey,
//     mintTokenTwo: PublicKey,
//     payer: PublicKey,
//     shares: anchor.BN,
// ) => {
//     const [poolPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("liquidity_pool"), Buffer.from(mintTokenOne > mintTokenTwo ? mintTokenOne.toBase58()+mintTokenTwo.toBase58() :  mintTokenTwo.toBase58()+mintTokenOne.toBase58()) ],
//         PROGRAM_ID
//     )

//     const [liquidityProviderAccount] = PublicKey.findProgramAddressSync(
//         [Buffer.from("LiqudityProvider"), poolPda.toBuffer(), payer.toBuffer()],
//         PROGRAM_ID
//     )

//     const poolTokenAccountOne = getAssociatedTokenAddressSync(mintTokenOne, poolPda); 
//     const poolTokenAccountTwo = getAssociatedTokenAddressSync(mintTokenOne, poolPda); 
//     const userTokenAccountOne = getAssociatedTokenAddressSync(mintTokenOne, payer); 
//     const userTokenAccountTwo = getAssociatedTokenAddressSync(mintTokenOne, payer); 

//     const acc: RemoveLiquidityAccounts = {
//         pool: poolPda,
//         liquidityProviderAccount,
//         mintTokenOne,
//         mintTokenTwo,
//         poolTokenAccountOne,
//         poolTokenAccountTwo,
//         userTokenAccountOne,
//         userTokenAccountTwo,
//         user: payer,
//         systemProgram: SystemProgram.programId,
//         tokenProgram:TOKEN_PROGRAM_ID,
//         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
//     }

//     const args: RemoveLiquidityArgs = {
//         shares
//     }
//     const ix = removeLiquidity(args, acc);

//     return {ix, acc}
// }

// export const createSwapIx = (
//     mintTokenOne: PublicKey,
//     mintTokenTwo: PublicKey,
//     payer: PublicKey,
//     amount: anchor.BN,
// ) => {
//     const [poolPda] = PublicKey.findProgramAddressSync(
//         [Buffer.from("liquidity_pool"), Buffer.from(mintTokenOne > mintTokenTwo ? mintTokenOne.toBase58()+mintTokenTwo.toBase58() :  mintTokenTwo.toBase58()+mintTokenOne.toBase58()) ],
//         PROGRAM_ID
//     )

//     const [dexConfigurationAccount] = PublicKey.findProgramAddressSync(
//         [Buffer.from("CurveConfiguration")],
//         PROGRAM_ID
//     )

//     const poolTokenAccountOne = getAssociatedTokenAddressSync(mintTokenOne, poolPda); 
//     const poolTokenAccountTwo = getAssociatedTokenAddressSync(mintTokenOne, poolPda); 
//     const userTokenAccountOne = getAssociatedTokenAddressSync(mintTokenOne, payer); 
//     const userTokenAccountTwo = getAssociatedTokenAddressSync(mintTokenOne, payer); 

//     const acc: SwapAccounts = {
//         dexConfigurationAccount,
//         pool: poolPda,
//         mintTokenOne,
//         mintTokenTwo,
//         poolTokenAccountOne,
//         poolTokenAccountTwo,
//         userTokenAccountOne,
//         userTokenAccountTwo,
//         user: payer,
//         systemProgram: SystemProgram.programId,
//         tokenProgram:TOKEN_PROGRAM_ID,
//         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
//     }

//     const args: SwapArgs = {
//         amount
//     }
//     const ix = swap(args, acc);

//     return {ix, acc}
// }
export const removeLiquidityIx = async (
  mintToken: PublicKey,
  amountOne: anchor.BN,
  amountTwo: anchor.BN,
  payer: PublicKey,
  connection: Connection
) => {
  console.log("Preparing Remove Liquidity Call")
  const ixs: TransactionInstruction[] = [];
  const signers: any[] = [];

  // ✅ Token Mint Addresses
    const coinMint = mintToken;
    const pcMint = new PublicKey("So11111111111111111111111111111111111111112"); // SOL Mint Address

    // ✅ Compute Pool PDA
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("liquidity_pool"), mintToken.toBuffer()],
      PROGRAM_ID
    );

    // ✅ Compute Global Account PDA
    const [globalAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      PROGRAM_ID
    );

    // ✅ Get Token Accounts
    const poolTokenOne = await getAssociatedTokenAddress(
      mintToken, globalAccount, true
    );
    const userAta1 = await getAssociatedTokenAddress(
      mintToken, payer
    );

    // ✅ Derive additional required PDAs
    const [ammAuthority] = PublicKey.findProgramAddressSync(
      [poolPda.toBuffer()],
      RAYDIUM_AMM_PROGRAM_ID
    );

    const [ammOpenOrders] = PublicKey.findProgramAddressSync(
      [Buffer.from("open_orders"), poolPda.toBuffer()],
      RAYDIUM_AMM_PROGRAM_ID
    );

    const [lpMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp_mint"), poolPda.toBuffer()],
      RAYDIUM_AMM_PROGRAM_ID
    );

    const [coinVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("coin_vault"), poolPda.toBuffer()],
      RAYDIUM_AMM_PROGRAM_ID
    );

    const [pcVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("pc_vault"), poolPda.toBuffer()],
      RAYDIUM_AMM_PROGRAM_ID
    );

    const [ammTargetOrders] = PublicKey.findProgramAddressSync(
      [Buffer.from("target_orders"), poolPda.toBuffer()],
      RAYDIUM_AMM_PROGRAM_ID
    );

    const [ammConfigId] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"), poolPda.toBuffer()],
      RAYDIUM_AMM_PROGRAM_ID
    );

    const [feeDestinationId] = PublicKey.findProgramAddressSync(
      [Buffer.from("fees"), poolPda.toBuffer()],
      RAYDIUM_AMM_PROGRAM_ID
    );

    // ✅ Fetch Serum Market ID dynamically
    const marketId = await fetchMarketId(mintToken, connection);
    console.log("✅ Found Serum Market ID:", marketId.toString());

    console.log("🔹 Creating Raydium Pool...");

    const marketProgramId = new PublicKey("9xQeWvG816bUx9EPXyAC2w4kQQ9zMEyCfmSZTQhF7w5");

    const userWallet = payer;
    const userCoinVault = await getAssociatedTokenAddress(coinMint, userWallet);
    const userPcVault = await getAssociatedTokenAddress(pcMint, userWallet);
    const userLpVault = await getAssociatedTokenAddress(lpMint, userWallet);

    const nonce = 255; // Adjust if necessary
    const openTime = new anchor.BN(Date.now() / 1000);
    const coinAmount = amountOne; // Amount of Token A
    const pcAmount = amountTwo; // Amount of SOL

    // ✅ Remove Liquidity Transaction
  try {
    console.log("🔹 Adding Remove Liquidity Instruction...");
    const acc = {
      pool: poolPda,
      globalAccount,
      mintTokenOne: coinMint,
      poolTokenAccountOne: poolTokenOne,
      userTokenAccountOne: userAta1,
      user: payer,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,  
    };
    ixs.push(removeLiquidity(acc));
  } catch (error) {
    console.log("❌ Error adding remove liquidity instruction:", error);
  }

  // ✅ Create Raydium Pool Transaction
  try {
    console.log("🔹 Creating Raydium Pool...");
    const raydiumTx = await Liquidity.makeCreatePoolV4InstructionV2({
      programId: RAYDIUM_AMM_PROGRAM_ID,
      ammId: poolPda,
      ammAuthority,
      ammOpenOrders,
      lpMint,
      coinMint,
      pcMint,
      coinVault,
      pcVault,
      ammTargetOrders,
      marketProgramId,
      marketId,
      userWallet,
      userCoinVault,
      userPcVault,
      userLpVault,
      ammConfigId,
      feeDestinationId,
      nonce,
      openTime,
      coinAmount,
      pcAmount,
    });

   // ✅ Extract `TransactionInstruction`s and signers
   ixs.push(...raydiumTx.innerTransaction.instructions);
   signers.push(...raydiumTx.innerTransaction.signers);
   
    console.log("✅ Raydium Pool Created:", poolPda.toBase58());
  } catch (error) {
    console.log("❌ Failed pool creation:", error);
  }

  // ✅ Return proper data for transaction execution
  return { ixs, signers };
};



// ✅ Helper function to fetch Serum Market ID
async function fetchMarketId(tokenMint: PublicKey, connection: Connection) {
  const response = await fetch("https://api.raydium.io/v2/sdk/liquidity/mainnet.json");
  const pools = await response.json();

  for (const pool of pools) {
    if (pool.baseMint === tokenMint.toString() || pool.quoteMint === tokenMint.toString()) {
      return new PublicKey(pool.market);
    }
  }

  throw new Error("❌ Serum Market ID not found.");
}

export const makeTxVersion = TxVersion.LEGACY; // LEGACY