"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRaydium = exports.cancelCoin = exports.checkTransactionStatus = exports.createToken = exports.initializeTx = exports.uploadMetadata = exports.adminKeypair = exports.connection = exports.priorityFeeInstruction = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const umi_1 = require("@metaplex-foundation/umi");
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const Coin_1 = __importDefault(require("../models/Coin"));
const web3Provider_1 = require("./web3Provider");
const anchor_1 = require("@coral-xyz/anchor");
const nodewallet_1 = __importDefault(require("@coral-xyz/anchor/dist/cjs/nodewallet"));
const programId_1 = require("./cli/programId");
const coinStatus_1 = require("../routes/coinStatus");
const CoinsStatus_1 = __importDefault(require("../models/CoinsStatus"));
const rpc_1 = require("@coral-xyz/anchor/dist/cjs/utils/rpc");
const sdk_1 = __importDefault(require("@pinata/sdk"));
const config_1 = require("../config/config");
const calculateTokenPrice_1 = require("../utils/calculateTokenPrice");
const mpl_toolbox_1 = require("@metaplex-foundation/mpl-toolbox");
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL;
exports.priorityFeeInstruction = web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: config_1.priorityLamports, // Higher value = Higher priority
});
const rpc = process.env.RPC_ENDPOINT || "";
exports.connection = new web3_js_1.Connection(rpc);
const privateKey = bs58_1.default.decode(process.env.PRIVATE_KEY);
exports.adminKeypair = anchor_1.web3.Keypair.fromSecretKey(privateKey);
const adminWallet = new nodewallet_1.default(exports.adminKeypair);
// const umi = createUmi(process.env.PUBLIC_SOLANA_RPC!);
const umi = (0, umi_bundle_defaults_1.createUmi)(rpc);
const userWallet = umi.eddsa.createKeypairFromSecretKey(privateKey);
const userWalletSigner = (0, umi_1.createSignerFromKeypair)(umi, userWallet);
umi.use((0, umi_1.signerIdentity)(userWalletSigner));
umi.use((0, mpl_token_metadata_1.mplTokenMetadata)());
const uploadMetadata = async (data) => {
    // const url = data.url;
    // const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS/'
    // console.log(data)
    const metadata = {
        name: data.name,
        ticker: data.ticker,
        URL: data.url,
        description: data.description,
    };
    const pinata = new sdk_1.default({ pinataJWTKey: PINATA_SECRET_API_KEY });
    try {
        const res = await pinata.pinJSONToIPFS(metadata);
        // console.log(res, "======")
        return res;
    }
    catch (error) {
        console.error('Error uploading metadata: ', error);
        return error;
    }
};
exports.uploadMetadata = uploadMetadata;
// Initialize Transaction for smart contract
const initializeTx = async () => {
    const initTx = await (0, web3Provider_1.initializeIx)(adminWallet.publicKey);
    const createTx = new web3_js_1.Transaction().add(initTx.ix);
    // console.log(adminWallet.publicKey.toBase58())
    createTx.feePayer = adminWallet.publicKey;
    createTx.recentBlockhash = (await exports.connection.getLatestBlockhash()).blockhash;
    createTx.add(exports.priorityFeeInstruction);
    const txId = await (0, web3_js_1.sendAndConfirmTransaction)(exports.connection, createTx, [exports.adminKeypair]);
    // console.log("txId:", txId)
};
exports.initializeTx = initializeTx;
// Create Token and add liquidity transaction
const createToken = async (data, creatorWallet) => {
    try {
        console.log("Starting token creation for:", data.name);
        const uri = await (0, exports.uploadMetadata)(data);
        // console.log("Metadata uploaded:", uri);
        const mint = (0, umi_1.generateSigner)(umi);
        // console.log("Mint address generated:", mint.publicKey);
        const tx = (0, umi_1.transactionBuilder)()
            .add((0, mpl_toolbox_1.setComputeUnitPrice)(umi, { microLamports: config_1.priorityLamports })) // Add priority fee
            .add((0, mpl_token_metadata_1.createAndMint)(umi, {
            mint,
            authority: umi.identity,
            name: data.name,
            symbol: data.ticker,
            uri: data.url,
            sellerFeeBasisPoints: (0, umi_1.percentAmount)(0),
            decimals: 6,
            amount: config_1.totalSupply,
            tokenOwner: userWallet.publicKey,
            tokenStandard: mpl_token_metadata_1.TokenStandard.Fungible,
        }));
        const mintTx = await tx.sendAndConfirm(umi);
        console.log(userWallet.publicKey, "Successfully minted 1 billion tokens (", mint.publicKey, ")");
        console.log("Mint transaction:", mintTx);
        await sleep(10000);
        // console.log("Starting LP creation...");
        try {
            // console.log("Checking if Program needs initialization...");
            const [globalAccount] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("global")], programId_1.PROGRAM_ID);
            // console.log("Global Account:", globalAccount.toBase58());
            const accountInfo = await exports.connection.getAccountInfo(globalAccount);
            // First initialize Program config if Needed
            if (!accountInfo) {
                console.log("Initializing Program.....");
                const initTx = await (0, web3Provider_1.initializeIx)(exports.adminKeypair.publicKey);
                const initCreateTx = new web3_js_1.Transaction().add(initTx.ix);
                initCreateTx.feePayer = adminWallet.publicKey;
                initCreateTx.recentBlockhash = (await exports.connection.getLatestBlockhash()).blockhash;
                // Add priority fee to transaction
                initCreateTx.add(exports.priorityFeeInstruction);
                const initTxId = await (0, web3_js_1.sendAndConfirmTransaction)(exports.connection, initCreateTx, [exports.adminKeypair]);
                console.log("Initial Setup txId:", initTxId);
                await sleep(2000);
            }
            /*
                // Then initialize the pool for this specific token
                // console.log("Initializing pool for token:", mint.publicKey);
                const poolInitTx = await initializePoolIx(new PublicKey(mint.publicKey), adminKeypair.publicKey);
                const poolInitCreateTx = new Transaction().add(poolInitTx.ix);
                poolInitCreateTx.feePayer = adminWallet.publicKey;
                poolInitCreateTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                
                const poolInitTxId = await sendAndConfirmTransaction(connection, poolInitCreateTx, [adminKeypair]);
                // console.log("Pool initialization txId:", poolInitTxId);
            */
            await sleep(2000);
            // Now proceed with LP creation
            console.log("Starting LP creation...");
            console.log("wallet", creatorWallet);
            const lpTx = await (0, web3Provider_1.createLPIx)(new web3_js_1.PublicKey(mint.publicKey), exports.adminKeypair.publicKey, new web3_js_1.PublicKey(creatorWallet));
            const createTx = new web3_js_1.Transaction().add(lpTx.ix);
            createTx.feePayer = adminWallet.publicKey;
            createTx.recentBlockhash = (await exports.connection.getLatestBlockhash()).blockhash;
            // Add priority fee to transaction
            createTx.add(exports.priorityFeeInstruction);
            // console.log("Simulating transaction before sending...");
            const simulation = await exports.connection.simulateTransaction(createTx);
            if (simulation.value.err) {
                console.error("Transaction simulation failed:", simulation.value.err);
                console.error("Simulation logs:", simulation.value.logs);
                throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
            }
            // console.log("Simulation successful");
            const txId = await (0, web3_js_1.sendAndConfirmTransaction)(exports.connection, createTx, [exports.adminKeypair], {
                skipPreflight: true,
                commitment: 'confirmed'
            });
            // console.log("LP transaction successful, txId:", txId);
            // Database operations
            const urlSeg = data.url.split('/');
            const gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
            const url = `${gatewayUrl}/${urlSeg[urlSeg.length - 1]}`;
            // console.log('Constructed URL:', url);
            const tokenAddress = mint.publicKey.toString();
            const newCoin = new Coin_1.default({
                creator: data.creator,
                name: data.name,
                ticker: data.ticker,
                description: data.description,
                token: tokenAddress,
                lastPrice: (config_1.INITIAL_PRICE / 1000).toFixed(15).replace(/0+$/, ''),
                url,
                isMigrated: false,
                twitter: data.twitter,
                telegram: data.telegram,
                website: data.website,
                autoMigrate: data.autoMigrate,
            });
            // console.log("Saving coin to database:", newCoin);
            const response = await newCoin.save();
            // console.log("Coin saved successfully");
            const newCoinStatus = new CoinsStatus_1.default({
                coinId: response._id,
                record: [
                    {
                        holder: response.creator,
                        holdingStatus: 2,
                        amount: 0,
                        tx: txId,
                        price: (config_1.INITIAL_PRICE / 1000).toFixed(15).replace(/0+$/, '')
                    }
                ]
            });
            await newCoinStatus.save();
            // console.log("Coin status saved successfully");
            return response;
        }
        catch (err) {
            if (err instanceof Error) {
                console.error("LP Creation failed:", err.message);
                if ('logs' in err) {
                    console.error("Program logs:", err.logs);
                }
            }
            else {
                console.error("LP Creation failed with unknown error:", err);
            }
            return "transaction failed";
        }
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Token creation failed:", err.message);
            if ('logs' in err) {
                console.error("Program logs:", err.logs);
            }
        }
        else {
            console.error("Token creation failed with unknown error:", err);
        }
        return "token creation failed";
    }
};
exports.createToken = createToken;
// check transaction
const checkTransactionStatus = async (transactionId) => {
    try {
        // Fetch the transaction details using the transaction ID
        const transactionResponse = await exports.connection.getTransaction(transactionId);
        // If the transactionResponse is null, the transaction is not found
        if (transactionResponse === null) {
            console.log(`Transaction ${transactionId} not found.`);
            return false;
        }
        // Check the status of the transaction
        if (transactionResponse.meta && transactionResponse.meta.err === null) {
            return true;
        }
        else {
            console.log(`Transaction ${transactionId} failed with error: ${transactionResponse.meta?.err}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error fetching transaction ${transactionId}:`, error);
        return false;
    }
};
exports.checkTransactionStatus = checkTransactionStatus;
const processedSignatures = new Set(); // Track already processed transactions
exports.connection.onLogs(programId_1.PROGRAM_ID, async (logs, ctx) => {
    if (logs.err !== null) {
        return;
    }
    if (processedSignatures.has(logs.signature) || logs.signature === "1111111111111111111111111111111111111111111111111111111111111111") {
        return;
    }
    console.log(logs);
    let isSwap = false;
    let isRemove = false;
    processedSignatures.add(logs.signature);
    logs.logs.forEach((log) => {
        if (log.includes('RemovalData:')) {
            isRemove = true;
        }
        if (log.includes('SwapData:')) {
            isSwap = true;
        }
    });
    if (isSwap || isRemove) {
        const parsedData = parseLogs(logs.logs, logs.signature);
        const launchPrice = (parsedData.reserve2 / 1e9) / (parsedData.reserve1 / 1e6);
        const solPrice = await (0, calculateTokenPrice_1.fetchSolPrice)();
        const launchMarketCap = (launchPrice * solPrice) * (config_1.totalSupply / 1e6);
        // console.log(`  MarketCapAtLaunch $${launchMarketCap}`)
        await (0, coinStatus_1.setCoinStatus)(parsedData);
        const coin = await Coin_1.default.findOne({ token: parsedData.mint });
        /*
                console.log("AUTOMIGRATE?:", coin?.autoMigrate)
                console.log('Current Info:', {
                    solReserve: parsedData.reserve2 / 1e9,
                    Progress: launchMarketCap > marketCapGoal,
                    AutoMigrate: coin?.autoMigrate|| true,
                    marketCap: launchMarketCap,
                    Goal: marketCapGoal,
                    solPrice: solPrice,
                    launchPrice: launchPrice,
                });
                */
        const willAutoMigrate = coin?.autoMigrate ?? true;
        if (launchMarketCap > config_1.marketCapGoal && isSwap && willAutoMigrate) {
            console.log('🚀 Migration threshold reached! Moving to Raydium...');
            try {
                await (0, exports.createRaydium)(new web3_js_1.PublicKey(parsedData.mint), parsedData.reserve1, parsedData.reserve2);
            }
            catch (error) {
                console.error('Migration failed:', error);
            }
        }
    }
});
const cancelCoin = async (mint) => {
    const removeLiquidityTX = await (0, web3Provider_1.removeLiquidityIx)(new web3_js_1.PublicKey(mint), exports.adminKeypair.publicKey, 1);
    const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }));
    tx.add(removeLiquidityTX.ixs[0]);
    tx.feePayer = exports.adminKeypair.publicKey;
    tx.recentBlockhash = (await exports.connection.getLatestBlockhash()).blockhash;
    // ✅ Simulate transaction before sending
    console.log("🔹 Simulating Transaction...");
    await (0, rpc_1.simulateTransaction)(exports.connection, tx);
    // ✅ Send transaction with preflight check
    const sig = await (0, web3_js_1.sendAndConfirmTransaction)(exports.connection, tx, [exports.adminKeypair], {
        commitment: "finalized", // Ensures transaction is fully confirmed
    });
    console.log("✅ SALE HAS BEEN CANCELED!");
};
exports.cancelCoin = cancelCoin;
// Remove liquidity pool and Create Raydium Pool
const createRaydium = async (mint1, r1, r2) => {
    console.log('Starting Raydium migration for token:', mint1.toBase58());
    // Check wallet balance first
    const balance = await exports.connection.getBalance(exports.adminKeypair.publicKey);
    const requiredBalance = 5000000000; // 5 SOL to be safe
    if (balance < requiredBalance) {
        throw new Error(`Insufficient SOL balance. Have: ${balance / 1e9} SOL, Need: ${requiredBalance / 1e9} SOL`);
    }
    const amountOne = r1; // tokens to raydium
    const amountTwo = r2 - config_1.ourFeeToKeep; // sol to raydium minus fee
    // 🔹 Fetch remove liquidity instructions (returns structured output)
    const removeLiquidityTX = await (0, web3Provider_1.removeLiquidityIx)(mint1, exports.adminKeypair.publicKey, 0);
    const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }));
    tx.add(removeLiquidityTX.ixs[0]);
    tx.feePayer = exports.adminKeypair.publicKey;
    tx.recentBlockhash = (await exports.connection.getLatestBlockhash()).blockhash;
    // ✅ Simulate transaction before sending
    console.log("🔹 Simulating Transaction...");
    await (0, rpc_1.simulateTransaction)(exports.connection, tx);
    // ✅ Send transaction with preflight check
    const sig = await (0, web3_js_1.sendAndConfirmTransaction)(exports.connection, tx, [exports.adminKeypair], {
        commitment: "finalized", // Ensures transaction is fully confirmed
    });
    console.log("✅ LIQUIDITY REMOVED!");
    await sleep(20000);
    const marketId = await (0, web3Provider_1.createMarket)(mint1);
    // const marketId = "483bWr1PkiktzjSfRLqrv9VM6g6tDsSETJf8NruUQdna"
    (0, web3Provider_1.wrapSOLToWSOL)(exports.connection, exports.adminKeypair, amountTwo);
    await sleep(20000);
    const poolAddress = await (0, web3Provider_1.createAmmPool)(mint1, marketId, amountOne, amountTwo);
    console.log("✅ Migration to Raydium Complete!");
};
exports.createRaydium = createRaydium;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Get swap(buy and sell)
function parseLogs(logs, tx) {
    // console.log("📜 Raw logs received:", logs);
    const result = {
        tx,
        mint: '',
        owner: '',
        swapType: 0,
        swapAmount: 0,
        swapAmountOut: 0,
        price: "0",
        reserve1: 0,
        reserve2: 0,
        name: "",
        ticker: "",
        description: "",
        url: "",
        creator: null,
        isMigrated: false,
    };
    logs.forEach((log) => {
        if (log.includes('SwapData:') || log.includes('RemovalData:')) {
            const isRemoval = log.includes('RemovalData:');
            const data = log
                .replace(/Program log: (SwapData|RemovalData): /, "")
                .split(", ")
                .reduce((acc, entry) => {
                const [key, value] = entry.split(": ");
                acc[key.trim()] = value ? value.trim() : "";
                return acc;
            }, {});
            result.mint = data.Mint || '';
            result.owner = data.Caller || '';
            result.swapAmount = parseInt(data.AmountIn) || 0;
            result.swapAmountOut = parseInt(data.AmountOut) || 0;
            result.price = (parseFloat(data.Price) / 1000).toFixed(15).replace(/0+$/, '') || "0";
            result.swapType = parseInt(data.Style) || 0;
            result.reserve1 = parseInt(data.PostReserve1) || 0;
            result.reserve2 = parseInt(data.PostReserve2) || 0;
            if (isRemoval) {
                result.isMigrated = true;
            }
        }
    });
    // console.log("✅ Parsed Result:", result);
    return result;
}
