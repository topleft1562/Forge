"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTxVersion = exports.wrapSOLToWSOL = exports.createAmmPool = exports.createMarket = exports.removeLiquidityIx = exports.initializePoolIx = exports.initializeIx = exports.createLPIx = exports.initSdk = exports.txVersion = exports.owner = void 0;
const anchor = __importStar(require("@coral-xyz/anchor"));
const programId_1 = require("./cli/programId");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const instructions_1 = require("./cli/instructions");
const token_1 = require("@coral-xyz/anchor/dist/cjs/utils/token");
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const bn_js_1 = __importDefault(require("bn.js"));
const bs58_1 = __importDefault(require("bs58"));
const config_1 = require("../config/config");
const web3_1 = require("./web3");
const privateKey = bs58_1.default.decode(process.env.PRIVATE_KEY);
exports.owner = web3_js_1.Keypair.fromSecretKey(privateKey);
exports.txVersion = raydium_sdk_v2_1.TxVersion.V0; // or TxVersion.LEGACY
const POOL_SEED_PREFIX = "liquidity_pool";
let raydium;
const initSdk = async (params) => {
    if (raydium)
        return raydium;
    console.log(`connect to rpc ${web3_1.connection.rpcEndpoint} in ${config_1.cluster}`);
    raydium = await raydium_sdk_v2_1.Raydium.load({
        owner: exports.owner,
        connection: web3_1.connection,
        cluster: config_1.cluster === "mainnet-beta" ? 'mainnet' : 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: !params?.loadToken,
        blockhashCommitment: 'finalized',
        // urlConfigs: {
        //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
        // },
    });
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
    return raydium;
};
exports.initSdk = initSdk;
const createLPIx = async (mintToken, payer, creator) => {
    console.log("Starting createLPIx with:", {
        mintToken: mintToken.toBase58(),
        payer: payer.toBase58()
    });
    const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mintToken.toBuffer()], programId_1.PROGRAM_ID);
    // console.log("Pool PDA:", poolPda.toBase58());
    const [globalAccount] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("global")], programId_1.PROGRAM_ID);
    // console.log("Global Account:", globalAccount.toBase58());
    const poolTokenOne = await (0, spl_token_1.getAssociatedTokenAddress)(mintToken, globalAccount, true);
    // console.log("Pool Token Account:", poolTokenOne.toBase58());
    const userAta1 = await (0, spl_token_1.getAssociatedTokenAddress)(mintToken, payer);
    // console.log("User ATA:", userAta1.toBase58());
    const acc = {
        pool: poolPda,
        globalAccount,
        mintTokenOne: mintToken,
        poolTokenAccountOne: poolTokenOne,
        userTokenAccountOne: userAta1,
        user: payer,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId
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
    const args = {
        amountOne: new anchor.BN(config_1.totalSupply),
        amountTwo: new anchor.BN(config_1.initialSOL),
        creator
    };
    console.log("AddLiquidity Args:", {
        amountOne: args.amountOne.toString(),
        amountTwo: args.amountTwo.toString()
    });
    const ix = (0, instructions_1.addLiquidity)(args, acc);
    // console.log("AddLiquidity instruction created");
    return { ix, acc };
};
exports.createLPIx = createLPIx;
const initializeIx = async (payer) => {
    console.log("Starting initializeIx with payer:", payer.toBase58());
    const [globalAccount] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("global")], programId_1.PROGRAM_ID);
    // console.log("Global Account:", globalAccount.toBase58());
    const acc = {
        globalAccount,
        admin: payer,
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
        systemProgram: web3_js_1.SystemProgram.programId
    };
    /*
    console.log("Initialize Accounts:", {
      globalAccount: acc.globalAccount.toBase58(),
      admin: acc.admin.toBase58(),
    });
  */
    const ix = (0, instructions_1.initialize)(acc);
    // console.log("Initialize instruction created");
    return { ix, acc };
};
exports.initializeIx = initializeIx;
// Add a new function for pool initialization
const initializePoolIx = async (mintToken, payer) => {
    /*
    console.log("Starting initializePoolIx with:", {
      mintToken: mintToken.toBase58(),
      payer: payer.toBase58()
    });
  */
    const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("liquidity_pool"), mintToken.toBuffer()], programId_1.PROGRAM_ID);
    console.log("Pool PDA:", poolPda.toBase58());
    const acc = {
        pool: poolPda,
        mintTokenOne: mintToken,
        user: payer,
        systemProgram: web3_js_1.SystemProgram.programId
    };
    const ix = (0, instructions_1.initializePool)(acc);
    // console.log("Pool initialization instruction created");
    return { ix, acc };
};
exports.initializePoolIx = initializePoolIx;
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
const removeLiquidityIx = async (mintToken, payer, isCancel) => {
    console.log("Preparing Remove Liquidity Call");
    const ixs = [];
    // ✅ Token Mint Addresses
    const coinMint = mintToken;
    // ✅ Compute Pool PDA
    const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("liquidity_pool"), mintToken.toBuffer()], programId_1.PROGRAM_ID);
    // ✅ Compute Global Account PDA
    const [globalAccount] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("global")], programId_1.PROGRAM_ID);
    // ✅ Get Token Accounts
    const poolTokenOne = await (0, spl_token_1.getAssociatedTokenAddress)(mintToken, globalAccount, true);
    const userAta1 = await (0, spl_token_1.getAssociatedTokenAddress)(mintToken, payer);
    try {
        console.log("🔹 Adding Remove Liquidity Instruction...");
        const acc = {
            pool: poolPda,
            globalAccount,
            mintTokenOne: coinMint,
            poolTokenAccountOne: poolTokenOne,
            userTokenAccountOne: userAta1,
            user: payer,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
        };
        const args = {
            isCancel: new bn_js_1.default(isCancel)
        };
        console.log(poolPda.toString(), globalAccount.toString(), coinMint.toString(), poolTokenOne.toString(), userAta1.toString(), payer.toString());
        ixs.push((0, instructions_1.removeLiquidity)(args, acc));
    }
    catch (error) {
        console.log("❌ Error adding remove liquidity instruction:", error);
    }
    return { ixs };
};
exports.removeLiquidityIx = removeLiquidityIx;
const createMarket = async (tokenMint) => {
    console.log("🔹 Creating Raydium Market...");
    const raydium = await (0, exports.initSdk)();
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
            mint: raydium_sdk_v2_1.WSOLMint,
            decimals: 9,
        },
        lotSize: 1,
        tickSize: 0.01,
        dexProgramId: config_1.cluster === "mainnet-beta" ? raydium_sdk_v2_1.OPEN_BOOK_PROGRAM : raydium_sdk_v2_1.DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
        // dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET, // devnet
        // requestQueueSpace: 5120 + 12, // optional
        // eventQueueSpace: 262144 + 12, // optional
        // orderbookQueueSpace: 65536 + 12, // optional
        txVersion: exports.txVersion,
        // optional: set up priority fee here
        // computeBudgetConfig: {
        //   units: 600000,
        //   microLamports: 46591500,
        // },
    });
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
    try {
        const txIds = await execute({
            // set sequentially to true means tx will be sent when previous one confirmed
            sequentially: true,
        });
    }
    catch {
        console.log("MarketCreation Failed");
    }
    // console.log('create market txIds:', txIds)
    console.log("Market Address:", extInfo.address.marketId);
    return extInfo.address.marketId;
};
exports.createMarket = createMarket;
const createAmmPool = async (mint1, marketId, amount1, amount2) => {
    console.log("🔹 Creating Raydium AMM Pool...");
    const raydium = await (0, exports.initSdk)();
    // Convert mint and marketId to PublicKey if they are strings
    const baseMint = new web3_js_1.PublicKey(mint1);
    const marketPubkey = new web3_js_1.PublicKey(marketId);
    const WSOLMint = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112"); // WSOL
    // Convert liquidity amounts to BN format
    const baseAmount = new bn_js_1.default(amount1);
    const quoteAmount = new bn_js_1.default(amount2);
    const { execute, extInfo } = await raydium.liquidity.createPoolV4({
        programId: config_1.cluster === "mainnet-beta" ? raydium_sdk_v2_1.AMM_V4 : raydium_sdk_v2_1.DEVNET_PROGRAM_ID.AmmV4,
        // programId: DEVNET_PROGRAM_ID.AmmV4, // devnet
        marketInfo: {
            marketId: marketPubkey,
            programId: config_1.cluster === "mainnet-beta" ? raydium_sdk_v2_1.OPEN_BOOK_PROGRAM : raydium_sdk_v2_1.DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
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
        startTime: new bn_js_1.default(0), // Start immediately
        ownerInfo: {
            useSOLBalance: true, // Use wallet SOL balance
        },
        associatedOnly: false, // Allow non-associated accounts
        txVersion: // Allow non-associated accounts
        exports.txVersion, // Use legacy transactions for compatibility
        // feeDestinationId: FEE_DESTINATION_ID, // Fee receiver for liquidity
        feeDestinationId: config_1.cluster === "mainnet-beta" ? raydium_sdk_v2_1.FEE_DESTINATION_ID : raydium_sdk_v2_1.DEVNET_PROGRAM_ID.FEE_DESTINATION_ID, // devnet
    });
    console.log("Executing AMM Pool Transaction...");
    const txHash = await execute().catch(async (error) => {
        console.error("❌ Transaction failed!", error);
        // Fetch transaction logs
        const txStatus = await web3_1.connection.getSignatureStatus(error.txid, { searchTransactionHistory: true });
        console.log("🔍 Logs:", txStatus?.value?.err);
    });
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
    console.log(extInfo.address.ammId.toBase58());
    return extInfo.address.ammId.toBase58();
};
exports.createAmmPool = createAmmPool;
async function wrapSOLToWSOL(connection, user, amountLamports) {
    console.log("🔹 Converting to WSOL...");
    const wsolMint = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112"); // WSOL Mint Address
    // Get the user's WSOL Associated Token Account (ATA)
    const userWSOLAccount = await (0, spl_token_1.getAssociatedTokenAddress)(wsolMint, user.publicKey);
    const tx = new web3_js_1.Transaction().add(
    // 1️⃣ Create WSOL ATA if it does not exist
    (0, spl_token_1.createAssociatedTokenAccountInstruction)(user.publicKey, userWSOLAccount, user.publicKey, wsolMint), 
    // 2️⃣ Transfer SOL to the WSOL Account
    web3_js_1.SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: userWSOLAccount,
        lamports: amountLamports,
    }), 
    // 3️⃣ Sync WSOL Balance
    (0, spl_token_1.createSyncNativeInstruction)(userWSOLAccount));
    tx.add(web3_1.priorityFeeInstruction);
    const txId = await connection.sendTransaction(tx, [user]);
    // console.log("✅ Wrapped SOL. Transaction:", txId);
    return userWSOLAccount;
}
exports.wrapSOLToWSOL = wrapSOLToWSOL;
exports.makeTxVersion = raydium_sdk_v2_1.TxVersion.LEGACY; // LEGACY
