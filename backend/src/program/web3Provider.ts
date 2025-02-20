import * as anchor from "@coral-xyz/anchor"
import { PROGRAM_ID } from "./cli/programId"
import { ComputeBudgetProgram, clusterApiUrl, Connection, PublicKey, Keypair, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction, } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createSyncNativeInstruction } from "@solana/spl-token"
import { AddLiquidityAccounts, AddLiquidityArgs, InitializeAccounts, InitializePoolAccounts, RemoveLiquidityAccounts, SwapAccounts, SwapArgs, addLiquidity, initialize, initializePool, removeLiquidity, swap } from "./cli/instructions"
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token"
import { 
  Raydium, TxVersion, WSOLMint, FEE_DESTINATION_ID,
  DEVNET_PROGRAM_ID,
  MARKET_STATE_LAYOUT_V3,
  OPEN_BOOK_PROGRAM,
  ApiV3PoolInfoStandardItem,
  TokenAmount,
  toToken,
  Percent,
  AmmV4Keys,
  AmmV5Keys,
} from '@raydium-io/raydium-sdk-v2'
import bs58 from 'bs58'
import BN from 'bn.js'
import Decimal from "decimal.js";


const pkey = process.env.PRIVATE_KEY
export const owner: Keypair = Keypair.fromSecretKey(bs58.decode(pkey))
// export const connection = new Connection('<YOUR_RPC_URL>') //<YOUR_RPC_URL>
export const connection = new Connection(clusterApiUrl('devnet')) //<YOUR_RPC_URL>
export const txVersion = TxVersion.V0 // or TxVersion.LEGACY
const cluster = 'devnet' // 'mainnet' | 'devnet'

const POOL_SEED_PREFIX = "liquidity_pool"

let raydium: Raydium | undefined
export const initSdk = async (params?: { loadToken?: boolean }) => {
  if (raydium) return raydium
  if (connection.rpcEndpoint === clusterApiUrl('devnet'))
    console.warn('using free rpc node might cause unexpected error, strongly suggest uses paid rpc node')
  console.log(`connect to rpc ${connection.rpcEndpoint} in ${cluster}`)
  raydium = await Raydium.load({
    owner,
    connection,
    cluster,
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
  payer: PublicKey,
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
    console.log(
      poolPda.toString(),
      globalAccount.toString(),
      coinMint.toString(),
      poolTokenOne.toString(),
      userAta1.toString(),
      payer.toString(),
    )
    ixs.push(removeLiquidity(acc));
  } catch (error) {
    console.log("❌ Error adding remove liquidity instruction:", error);
  }

  return { ixs };
};


export const createMarket = async (tokenMint: any) => {
  const raydium = await initSdk()

  // check mint info here: https://api-v3.raydium.io/mint/list
  // or get mint info by api: await raydium.token.getTokenInfo('mint address')

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
    dexProgramId: OPEN_BOOK_PROGRAM,
    // dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET, // devnet

    // requestQueueSpace: 5120 + 12, // optional
    // eventQueueSpace: 262144 + 12, // optional
    // orderbookQueueSpace: 65536 + 12, // optional

    txVersion,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
  })

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

  const txIds = await execute({
    // set sequentially to true means tx will be sent when previous one confirmed
    sequentially: true,
  })

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
  try {
    const raydium = await initSdk();

    // Convert mint and marketId to PublicKey if they are strings
    const baseMint = new PublicKey(mint1);
    const marketPubkey = new PublicKey(marketId);
    const WSOLMint = new PublicKey("So11111111111111111111111111111111111111112"); // WSOL

    // Convert liquidity amounts to BN format
    const baseAmount = new BN(amount1 * 10 ** 6); // Assume 6 decimals for SPL tokens
    const quoteAmount = new BN(amount2 * 10 ** 9); // Assume 9 decimals for SOL

    console.log("Initializing AMM Pool on Devnet...");
    console.log(`Base Mint: ${baseMint.toBase58()}`);
    console.log(`Market ID: ${marketPubkey.toBase58()}`);
    console.log(`Base Amount: ${baseAmount.toString()} | Quote Amount: ${quoteAmount.toString()}`);

    const { execute, extInfo } = await raydium.liquidity.createPoolV4({
      programId: DEVNET_PROGRAM_ID.AmmV4, // Devnet AMM V4 program
      marketInfo: {
        marketId: marketPubkey,
        programId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET, // Devnet OpenBook program
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
      feeDestinationId: FEE_DESTINATION_ID, // Fee receiver for liquidity
    });

    console.log("Executing AMM Pool Transaction...");
    const txHash = await execute();
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
  console.log(extInfo.address.ammId.toBase58())
  return extInfo.address.ammId.toBase58()
} catch{console.log("failed")}
return ""
}

export const addLiquidityRaydium = async (poolId: any) => {
  const raydium = await initSdk()
console.log(poolId)
  // RAY-USDC pool
  // const poolId = '6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg'
  let poolKeys: AmmV4Keys | AmmV5Keys | undefined
  let poolInfo: ApiV3PoolInfoStandardItem

  if (raydium.cluster === 'mainnet') {
    // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
    // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
    const data = await raydium.api.fetchPoolById({ ids: poolId })
    poolInfo = data[0] as ApiV3PoolInfoStandardItem
  } else {
    // note: getPoolInfoFromRpc method only return required pool data for computing not all detail pool info
    const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId })
    poolInfo = data.poolInfo
    poolKeys = data.poolKeys
  }

  // if (!isValidAmm(poolInfo.programId)) throw new Error('target pool is not AMM pool')

  const inputAmount = '1'

  const r = raydium.liquidity.computePairAmount({
    poolInfo,
    amount: inputAmount,
    baseIn: true,
    slippage: new Percent(1, 100), // 1%
  })

  const { execute, transaction } = await raydium.liquidity.addLiquidity({
    poolInfo,
    poolKeys,
    amountInA: new TokenAmount(
      toToken(poolInfo.mintA),
      new Decimal(inputAmount).mul(10 ** poolInfo.mintA.decimals).toFixed(0)
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

  // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
  const { txId } = await execute({ sendAndConfirm: true })
  console.log('liquidity added:', { txId: `https://explorer.solana.com/tx/${txId}` })
  process.exit() // if you don't want to end up node execution, comment this line
}


export async function wrapSOLToWSOL(connection: Connection, user: Keypair, amountLamports: number) {
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

  const txId = await connection.sendTransaction(tx, [user]);
  console.log("✅ Wrapped SOL. Transaction:", txId);

  return userWSOLAccount;
}


export const makeTxVersion = TxVersion.LEGACY; // LEGACY