import * as anchor from "@coral-xyz/anchor"
import { PublicKey, Keypair, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction, TransactionInstruction} from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createSyncNativeInstruction } from "@solana/spl-token"
import { AddLiquidityAccounts, AddLiquidityArgs, InitializeAccounts, InitializePoolAccounts, addLiquidity, initialize, initializePool, removeLiquidity } from "./cli/instructions"
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token"
import { 
  Raydium, TxVersion,
  DEVNET_PROGRAM_ID,
  Percent,
  getCpmmPdaAmmConfigId,
  CREATE_CPMM_POOL_PROGRAM,
  CREATE_CPMM_POOL_FEE_ACC,
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  DEV_CREATE_CPMM_POOL_PROGRAM
} from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import base58 from "bs58"
import { cluster, initialSOL, totalSupply } from "../config/config"
import { adminKeypair, connection } from "./web3"
import { PROGRAM_ID } from "./cli/programId";
import Decimal from 'decimal.js'



const privateKey = base58.decode(process.env.PRIVATE_KEY!);

export const owner: Keypair = Keypair.fromSecretKey(privateKey)

export const txVersion = TxVersion.V0 // or TxVersion.LEGACY

const POOL_SEED_PREFIX = "liquidity_pool"

let raydium: Raydium | undefined
export const initSdk = async (params?: { loadToken?: boolean }) => {
  // console.log(raydium)

  if (raydium) return raydium

  console.log(`connect to rpc ${connection.rpcEndpoint} in ${cluster}`)
  raydium = await Raydium.load({
    owner,
    connection,
    cluster: cluster === "mainnet" ? 'mainnet' : 'devnet',
    disableFeatureCheck: true,
    disableLoadToken: !params?.loadToken,
    blockhashCommitment: 'finalized',
  })
  return raydium
}

export const createLPIx = async (
  mintToken: PublicKey,
  payer: PublicKey,
  creator: PublicKey,
) => {
  console.log("Starting createLPIx with:", {
    mintToken: mintToken.toBase58(),
    payer: payer.toBase58()
  });

  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_SEED_PREFIX), mintToken.toBuffer()],
    PROGRAM_ID
  );

  const [globalAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    PROGRAM_ID
  );

  const poolTokenOne = await getAssociatedTokenAddress(
    mintToken, globalAccount, true
  );

  const userAta1 = await getAssociatedTokenAddress(
    mintToken, payer
  );

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
    amountOne: new anchor.BN(totalSupply),
    amountTwo: new anchor.BN(initialSOL),
    creator
  };
  
  console.log("AddLiquidity Args:", {
    amountOne: args.amountOne.toString(),
    amountTwo: args.amountTwo.toString()
  });

  const ix = addLiquidity(args, acc);

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

  const acc: InitializeAccounts = {
    globalAccount,
    admin: payer,
    rent: SYSVAR_RENT_PUBKEY,
    systemProgram: SystemProgram.programId
  };

  const ix = initialize(acc);

  return { ix, acc }
}


export const removeLiquidityIx = async (
  mintToken: PublicKey,
  payer: PublicKey,
  isCancel: number,
) => {
  console.log("Preparing Remove Liquidity Call")
  const ixs: TransactionInstruction[] = [];

  // ✅ Token Mint Addresses
    const coinMint = mintToken;

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
    const args = {
      isCancel: new BN(isCancel)
    }
    console.log(
      poolPda.toString(),
      globalAccount.toString(),
      coinMint.toString(),
      poolTokenOne.toString(),
      userAta1.toString(),
      payer.toString(),
    )
    ixs.push(removeLiquidity(args,acc));
  } catch (error) {
    console.log("❌ Error adding remove liquidity instruction:", error);
  }

  return { ixs };
};



export async function wrapSOLToWSOL(amountLamports: number) {
  console.log("🔹 Converting to WSOL...");

  const wsolMint = new PublicKey("So11111111111111111111111111111111111111112"); // WSOL Mint Address
  const user = adminKeypair;

  // Get the user's WSOL Associated Token Account (ATA)
  const userWSOLAccount = await getAssociatedTokenAddress(
    wsolMint,
    user.publicKey
  );

  // Check if the ATA exists
  let tx = new Transaction();

  try {
    const accountInfo = await connection.getAccountInfo(userWSOLAccount);
    if (accountInfo === null) {
      console.log("WSOL ATA does not exist. Creating it...");
      tx.add(
        createAssociatedTokenAccountInstruction(
          user.publicKey, 
          userWSOLAccount, 
          user.publicKey, 
          wsolMint
        )
      );
    } else {
      console.log("WSOL ATA already exists.");
    }

    tx.add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: userWSOLAccount,
        lamports: amountLamports,
      })
    );

    tx.add(createSyncNativeInstruction(userWSOLAccount));

    const txId = await connection.sendTransaction(tx, [user]);
    const txSignature = txId;
    console.log("Transaction ID:", txSignature);

    // Poll for transaction confirmation status
    const status = await pollForTransactionConfirmation(txSignature);
    if(status === false) {
     console.log("ERROR creating AMM POOL")
     return
    }
    console.log("✅ Wrapped SOL. Transaction ID:", txId);

    return userWSOLAccount;
  } catch (error) {
    console.error("Error during WSOL wrapping:", error);
    throw new Error(`Failed to wrap SOL`);
  }
}


// Helper function to poll for transaction confirmation
export const pollForTransactionConfirmation = async (txSignature: string): Promise<boolean> => {
  while (true) {
    // Poll the signature status
    const confirmation = await connection.getSignatureStatus(txSignature, { searchTransactionHistory: true });

    if (confirmation?.value) {
      if (confirmation.value.err) {
        console.log(`Transaction failed: ${txSignature}`);
        console.log(confirmation.value.err)
        return false
      } else if (confirmation.value.confirmationStatus === "finalized") {
        console.log(`Transaction confirmed: ${txSignature}`);
        return true; // Return "success" if the transaction is confirmed
      }
    }

    // If not finalized, wait for 2 seconds before retrying
    console.log("Polling... Waiting for confirmation...");
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};

export const createPool = async (
  mint1: string | PublicKey,
  amountSol: number,
  amountToken: number
) => {
  const raydium = await initSdk({ loadToken: true })

  // check token list here: https://api-v3.raydium.io/mint/list
  // TOKEN
  const mintA = await raydium.token.getTokenInfo(mint1)
  // WSOL
  const mintB = await raydium.token.getTokenInfo('So11111111111111111111111111111111111111112')
  /**
   * you also can provide mint info directly like below, then don't have to call token info api
   *  {
      address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 6,
    } 
   */

  const feeConfigs = await raydium.api.getCpmmConfigs()
  const isMainnet = cluster === "mainnet"
  const programId = isMainnet ? CREATE_CPMM_POOL_PROGRAM : DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM
  const poolFeeAccount = isMainnet ? CREATE_CPMM_POOL_FEE_ACC : DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC

  if (raydium.cluster === 'devnet') {
    feeConfigs.forEach((config) => {
      config.id = getCpmmPdaAmmConfigId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, config.index).publicKey.toBase58()
    })
  }

  const { execute, extInfo } = await raydium.cpmm.createPool({

    // poolId: // your custom publicKey, default sdk will automatically calculate pda pool id
    programId, // devnet: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM
    poolFeeAccount, // devnet:  DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC
    mintA,
    mintB,
    mintAAmount: new BN(amountToken),
    mintBAmount: new BN(amountSol),
    startTime: new BN(0),
    feeConfig: feeConfigs[0],
    associatedOnly: false,
    ownerInfo: {
      useSOLBalance: true,
    },
    txVersion,
    // optional: set up priority fee here
    computeBudgetConfig: {
       units: 600000,
       microLamports: 46591500,
    },
  })

  // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
  const tx = await execute({ sendAndConfirm: true })
  const txSignature = tx.txId; // Assuming the first transaction ID is the one you want to confirm
    console.log("Transaction ID:", txSignature);
  
      // Poll for transaction confirmation status
      const status = await pollForTransactionConfirmation(txSignature);
      if(status === false) {
       console.log("ERROR creating AMM POOL")
       return
      }

   const txid = tx.txId
  console.log('pool created', {
    txid,
    poolKeys: Object.keys(extInfo.address).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: extInfo.address[cur as keyof typeof extInfo.address].toString(),
      }),
      {}
    ),
  })
}

export const deposit = async (
  poolId: string | PublicKey,
  amountToken: number) => {
  const raydium = await initSdk()

  // SOL - USDC pool
  // const poolId = '7JuwJuNU88gurFnyWeiyGKbFmExMWcmRZntn9imEzdny'
  // const poolId = 'AerEBqpbRgCjZ1LL6ajyAKsjQcKDvGcAhdai7KdurEJE'
  let poolInfo: ApiV3PoolInfoStandardItemCpmm
  let poolKeys: CpmmKeys | undefined

  if (raydium.cluster === 'devnet') {
    // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
    // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
    const data = await raydium.api.fetchPoolById({ ids: poolId as string})
    poolInfo = data[0] as ApiV3PoolInfoStandardItemCpmm
    if (!isValidCpmm(poolInfo.programId)) throw new Error('target pool is not CPMM pool')
  } else {
    const data = await raydium.cpmm.getPoolInfoFromRpc(poolId as string)
    poolInfo = data.poolInfo
    poolKeys = data.poolKeys
  }

  const inputAmount = new BN(new Decimal(amountToken).toFixed(0))
  const slippage = new Percent(1, 100) // 1%
  const baseIn = true

  const { execute } = await raydium.cpmm.addLiquidity({
    poolInfo,
    poolKeys,
    inputAmount,
    slippage,
    baseIn,
    txVersion,
    // optional: set up priority fee here
    computeBudgetConfig: {
       units: 600000,
       microLamports: 46591500,
    },

  })

  const tx = await execute({ sendAndConfirm: true })
  const txSignature = tx.txId;
  console.log("Transaction ID:", txSignature);

    const status = await pollForTransactionConfirmation(txSignature);
    if(status === false) {
     console.log("ERROR creating AMM POOL")
     return
    }

  // console.log('pool deposited', { txId: `https://explorer.solana.com/tx/${txId}` })
  // process.exit() // if you don't want to end up node execution, comment this line
}

const VALID_PROGRAM_ID = new Set([CREATE_CPMM_POOL_PROGRAM.toBase58(), DEV_CREATE_CPMM_POOL_PROGRAM.toBase58()])

export const isValidCpmm = (id: string) => VALID_PROGRAM_ID.has(id)