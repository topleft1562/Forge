import * as anchor from "@coral-xyz/anchor"
import { clusterApiUrl, Connection, PublicKey, Keypair, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction, Cluster, } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createSyncNativeInstruction } from "@solana/spl-token"
import { AddLiquidityAccounts, AddLiquidityArgs, InitializeAccounts, InitializePoolAccounts, RemoveLiquidityAccounts, SwapAccounts, SwapArgs, addLiquidity, initialize, initializePool, removeLiquidity, swap } from "./cli/instructions"
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token"
import { 
  Raydium, TxVersion, WSOLMint, FEE_DESTINATION_ID,
  DEVNET_PROGRAM_ID,
  OPEN_BOOK_PROGRAM,
  AMM_V4,
  AmmV4Keys,
  AmmV5Keys,
  ApiV3PoolInfoStandardItem,
  Percent,
  TokenAmount,
  toToken,
  AMM_STABLE
} from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import base58 from "bs58"
import { cluster, initialSOL, totalSupply } from "../config/config"
import { connection, priorityFeeInstruction } from "./web3"
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
    // urlConfigs: {
    //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
    // },
  })

  /**
   * By default: sdk will automatically fetch token account data when need it or any sol balace changed.
   * if you want to handle token account by yourself, set token account data after init sdk
   * code below shows how to do it.
   * note: after call raydium.account.updateTokenAccount, raydium will not automatically fetch token account
   */

  /*  
  raydium.account.updateTokenAccount(await fetchTokenAccountData())
  connection.onAccountChange(owner.publicKey, async () => {
    raydium!.account.updateTokenAccount(await fetchTokenAccountData())
  })
  */
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
    amountOne: new anchor.BN(totalSupply),
    amountTwo: new anchor.BN(initialSOL),
    creator
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


export const createMarket = async (tokenMint: PublicKey) => {
  console.log("🔹 Creating Raydium Market...");
  const raydium = await initSdk()

  // check mint info here: https://api-v3.raydium.io/mint/list
  // or get mint info by api: await raydium.token.getTokenInfo('mint address')
  const dexPID = cluster === "mainnet" ? OPEN_BOOK_PROGRAM : DEVNET_PROGRAM_ID.OPENBOOK_MARKET
  console.log("cluster", cluster, dexPID)
  // const token = await raydium.token.getTokenInfo(tokenMint)
  console.log("test")

  const { execute, extInfo, transactions } = await raydium.marketV2.create({
    baseInfo: {
      // create market doesn't support token 2022
      mint: tokenMint,
      decimals: 6,
    },
    quoteInfo: {
      // create market doesn't support token 2022
      mint: WSOLMint,
      decimals: 9,
    },
    lotSize: 1,
    tickSize: 0.01,
    dexProgramId: dexPID,
    // dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET, // devnet

    // requestQueueSpace: 5120 + 12, // optional
    // eventQueueSpace: 262144 + 12, // optional
    // orderbookQueueSpace: 65536 + 12, // optional

    txVersion,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 60000,
    //   microLamports: 46591500,
    // },
  })
  console.log("Market Address:", extInfo.address.marketId);
/*
  console.log(
    `create market total ${transactions.length} txs, market info: `,
    Object.keys(extInfo.address).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
      }),
      {}
    )
  )
*/
  console.log("test3")
  try {
  const txIds = await execute({
    // set sequentially to true means tx will be sent when previous one confirmed
    sequentially: true,
  })
  } catch (error) {
    console.log("MarketCreation Failed", error)
    throw Error("Failed on Market Creation")
  }
  // console.log('create market txIds:', txIds)
  console.log("Market Address:", extInfo.address.marketId);

  return extInfo.address.marketId
}

export const createAmmPool = async (
  mint1: string | PublicKey,
  marketId: string | PublicKey,
  amount1: number,
  amount2: number
) => {
  console.log("🔹 Creating Raydium AMM Pool...");

    const raydium = await initSdk();

    // Convert mint and marketId to PublicKey if they are strings
    const baseMint = new PublicKey(mint1);
    const marketPubkey = new PublicKey(marketId);
    const WSOLMint = new PublicKey("So11111111111111111111111111111111111111112"); // WSOL

    // Convert liquidity amounts to BN format
    const baseAmount = new BN(amount1);
    const quoteAmount = new BN(amount2);

    const RAYDIUM_AMM_PROGRAM_ID = new PublicKey("7biV4au8rBAmY4ohutXj9RfKYFAnD7Z6VwhLUrG7tXhM");

try {
    const { execute, extInfo } = await raydium.liquidity.createPoolV4({
      programId: cluster === "mainnet" ? RAYDIUM_AMM_PROGRAM_ID : DEVNET_PROGRAM_ID.AmmV4,
      // programId: DEVNET_PROGRAM_ID.AmmV4, // devnet
      marketInfo: {
        marketId: marketPubkey,
        programId: cluster === "mainnet" ? OPEN_BOOK_PROGRAM : DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
        // programId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET, // devent
      },
      baseMintInfo: {
        mint: baseMint,
        decimals: 6, // Adjust based on token decimals
      },
      quoteMintInfo: {
        mint: WSOLMint,
        decimals: 9, // WSOL decimals
      },
      baseAmount, // Liquidity amounts
      quoteAmount,

      startTime: new BN(0), // Start immediately
      ownerInfo: {
        useSOLBalance: true, // Use wallet SOL balance
      },
      associatedOnly: false, // Allow non-associated accounts
      txVersion, // Use legacy transactions for compatibility
      // feeDestinationId: FEE_DESTINATION_ID, // Fee receiver for liquidity
      feeDestinationId: cluster === "mainnet" ? FEE_DESTINATION_ID : DEVNET_PROGRAM_ID.FEE_DESTINATION_ID, // devnet
    });

    console.log("Executing AMM Pool Transaction...");
    console.log("amount1:SOL", amount1, "amount2:Token", amount2)
    try{
    const txHash = await execute().catch(async (error) => {
      console.error("❌ Transaction failed!", error);
  
      // Fetch transaction logs
      const txStatus = await connection.getSignatureStatus(error.txid, { searchTransactionHistory: true });
  
      console.log("🔍 Logs:", txStatus?.value?.err);
   
    });
  } catch(error) {
      throw Error(`error: ${error}`)
  }
/*
    console.log("✅ AMM Pool Created! Tx Hash:", txHash);
    console.log(
      'amm pool created! txId: ',
      txHash,
      ', poolKeys:',
      Object.keys(extInfo.address).reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: extInfo.address[cur as keyof typeof extInfo.address].toBase58(),
        }),
        {}
      )
    )
*/

  console.log(extInfo.address.ammId.toBase58())
  return extInfo.address.ammId.toBase58()
}catch (error){
    throw Error(`Jesus: ${error}`)
}
}

export const addLiquidityRaydium = async (poolId: string, amountSol: number, amountToken: number) => {
  const raydium = await initSdk()

  // RAY-USDC pool
  // const poolId = '6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg'
  let poolKeys: AmmV4Keys | AmmV5Keys | undefined
  let poolInfo: ApiV3PoolInfoStandardItem

  if (raydium.cluster === 'mainnet') {
    console.log("ranThis")
    // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
    // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
    const data = await raydium.api.fetchPoolById({ ids: poolId })
    poolInfo = data[0] as ApiV3PoolInfoStandardItem
   } else {
    console.log("this one")
    // note: getPoolInfoFromRpc method only return required pool data for computing not all detail pool info
  
    try{
      const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId })
      poolInfo = data.poolInfo
      poolKeys = data.poolKeys
    } catch {console.log("Failed")}
    throw Error("Failed to get poolinfo")
    
  }

console.log(poolKeys, poolInfo)

  // if (!isValidAmm(poolInfo.programId)) throw new Error('target pool is not AMM pool')

  const inputAmountSOL = amountSol

  const r = raydium.liquidity.computePairAmount({
    poolInfo,
    amount: inputAmountSOL.toString(),
    baseIn: true,
    slippage: new Percent(1, 100), // 1%
  })


  const { execute, transaction } = await raydium.liquidity.addLiquidity({
    poolInfo,
    poolKeys,
    amountInA: new TokenAmount(
      toToken(poolInfo.mintA),
      new Decimal(inputAmountSOL).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
    ),
    amountInB: new TokenAmount(
      toToken(poolInfo.mintB),
      new Decimal(r.maxAnotherAmount.toExact()).mul(10 ** poolInfo.mintB.decimals).toFixed(0)
    ),
    otherAmountMin: r.minAnotherAmount,
    fixedSide: 'a',
    txVersion,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },

    // optional: add transfer sol to tip account instruction. e.g sent tip to jito
    // txTipConfig: {
    //   address: new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'),
    //   amount: new BN(10000000), // 0.01 sol
    // },
  })

  console.log(
    amountToken,
    new TokenAmount(
      toToken(poolInfo.mintB),
      new Decimal(r.maxAnotherAmount.toExact()).mul(10 ** poolInfo.mintB.decimals).toFixed(0)
      ),
    amountSol,
    new TokenAmount(
      toToken(poolInfo.mintA),
      new Decimal(inputAmountSOL).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
    )
  )
  // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
  // const { txId } = await execute({ sendAndConfirm: true })
  // console.log('liquidity added:', { txId: `https://explorer.solana.com/tx/${txId}` })
 // process.exit() // if you don't want to end up node execution, comment this line
}


export async function wrapSOLToWSOL(connection: Connection, user: Keypair, amountLamports: number) {
  console.log("🔹 Converting to WSOL...");
  
  const wsolMint = new PublicKey("So11111111111111111111111111111111111111112"); // WSOL Mint Address
  
  // Get the user's WSOL Associated Token Account (ATA)
  const userWSOLAccount = await getAssociatedTokenAddress(
    wsolMint, 
    user.publicKey
  );

  const tx = new Transaction().add(
    // 1️⃣ Create WSOL ATA if it does not exist
    createAssociatedTokenAccountInstruction(
      user.publicKey, 
      userWSOLAccount, 
      user.publicKey, 
      wsolMint
    ),
    // 2️⃣ Transfer SOL to the WSOL Account
    SystemProgram.transfer({
      fromPubkey: user.publicKey,
      toPubkey: userWSOLAccount,
      lamports: amountLamports,
    }),
    // 3️⃣ Sync WSOL Balance
    createSyncNativeInstruction(userWSOLAccount)
  );

    tx.add(priorityFeeInstruction);
  const txId = await connection.sendTransaction(tx, [user]);
  // console.log("✅ Wrapped SOL. Transaction:", txId);

  return userWSOLAccount;
}


export const makeTxVersion = TxVersion.LEGACY; // LEGACY

const VALID_PROGRAM_ID = new Set([
  AMM_V4.toBase58(),
  AMM_STABLE.toBase58(),
  DEVNET_PROGRAM_ID.AmmV4.toBase58(),
  DEVNET_PROGRAM_ID.AmmStable.toBase58(),
])
export const isValidAmm = (id: string) => VALID_PROGRAM_ID.has(id)
