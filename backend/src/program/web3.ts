import { TokenStandard, createAndMint, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { ComputeBudgetProgram, Connection, PublicKey, SYSVAR_RENT_PUBKEY, Signer, SystemProgram, Transaction, TransactionResponse, clusterApiUrl, sendAndConfirmTransaction, TransactionInstruction, LAMPORTS_PER_SOL, Cluster } from "@solana/web3.js";
import base58 from "bs58";
import { Types } from "mongoose";
import Coin from "../models/Coin";
import { createAmmPool, createLPIx, createMarket, initializeIx, initializePoolIx, removeLiquidityIx, wrapSOLToWSOL } from "./web3Provider";
import { web3 } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { PROGRAM_ID } from "./cli/programId";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { SwapAccounts, SwapArgs, swap } from "./cli/instructions";
import * as anchor from "@coral-xyz/anchor"
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { setCoinStatus } from "../routes/coinStatus";
import CoinStatus from "../models/CoinsStatus";
import { simulateTransaction } from "@coral-xyz/anchor/dist/cjs/utils/rpc";
import pinataSDK from '@pinata/sdk';
import { cluster, INITIAL_PRICE, ourFeeToKeep, willMigrateAt } from "../config/config";

const curveSeed = "CurveConfiguration"
const POOL_SEED_PREFIX = "liquidity_pool"
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY
const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL;


export const connection = new Connection(clusterApiUrl(cluster))

const privateKey = base58.decode(process.env.PRIVATE_KEY!);

export const adminKeypair = web3.Keypair.fromSecretKey(privateKey);
const adminWallet = new NodeWallet(adminKeypair);

// const umi = createUmi(process.env.PUBLIC_SOLANA_RPC!);
const umi = createUmi(clusterApiUrl(cluster));

const userWallet = umi.eddsa.createKeypairFromSecretKey(privateKey);

const userWalletSigner = createSignerFromKeypair(umi, userWallet);
umi.use(signerIdentity(userWalletSigner));
umi.use(mplTokenMetadata());

export const uploadMetadata = async (data: CoinInfo): Promise<any> => {
    // const url = data.url;
    // const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS/'
    // console.log(data)
    const metadata = {
        name: data.name,
        ticker: data.ticker,
        URL: data.url,
        description: data.description,
    }
    const pinata = new pinataSDK({ pinataJWTKey: PINATA_SECRET_API_KEY });

    try {
        const res = await pinata.pinJSONToIPFS(metadata);
        // console.log(res, "======")
        return res
    } catch (error) {
        console.error('Error uploading metadata: ', error);
        return error;
    }
}
// Initialize Transaction for smart contract
export const initializeTx = async () => {
    const initTx = await initializeIx(adminWallet.publicKey);
    const createTx = new Transaction().add(initTx.ix);
    // console.log(adminWallet.publicKey.toBase58())

    createTx.feePayer = adminWallet.publicKey;
    createTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    const txId = await sendAndConfirmTransaction(connection, createTx, [adminKeypair]);
    // console.log("txId:", txId)
}


// Create Token and add liquidity transaction
export const createToken = async (data: CoinInfo) => {
    try {
        console.log("Starting token creation for:", data.name);
        const uri = await uploadMetadata(data);
        // console.log("Metadata uploaded:", uri);

        const mint = generateSigner(umi);
        // console.log("Mint address generated:", mint.publicKey);

        const tx = createAndMint(umi, {
            mint,
            authority: umi.identity,
            name: data.name,
            symbol: data.ticker,
            uri: data.url,
            sellerFeeBasisPoints: percentAmount(0),
            decimals: 6,
            amount: 1000_000_000_000_000,
            tokenOwner: userWallet.publicKey,
            tokenStandard: TokenStandard.Fungible,
        });

        const mintTx = await tx.sendAndConfirm(umi);
        // console.log(userWallet.publicKey, "Successfully minted 1 billion tokens (", mint.publicKey, ")");
        // console.log("Mint transaction:", mintTx);

        await sleep(5000);
        // console.log("Starting LP creation...");

        try {
            // console.log("Checking if Program needs initialization...");
           
            const [globalAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from("global")],
                PROGRAM_ID
              );
            // console.log("Global Account:", globalAccount.toBase58());
            const accountInfo = await connection.getAccountInfo(globalAccount);
            
            // First initialize Program config if Needed
            if (!accountInfo) {
                console.log("Initializing Program.....");
                const initTx = await initializeIx(adminKeypair.publicKey);
                const initCreateTx = new Transaction().add(initTx.ix);
                initCreateTx.feePayer = adminWallet.publicKey;
                initCreateTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                
                const initTxId = await sendAndConfirmTransaction(connection, initCreateTx, [adminKeypair]);
                console.log("Initial Setup txId:", initTxId);
                
                await sleep(2000);
            }
        
            // Then initialize the pool for this specific token
            // console.log("Initializing pool for token:", mint.publicKey);
            const poolInitTx = await initializePoolIx(new PublicKey(mint.publicKey), adminKeypair.publicKey);
            const poolInitCreateTx = new Transaction().add(poolInitTx.ix);
            poolInitCreateTx.feePayer = adminWallet.publicKey;
            poolInitCreateTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            
            const poolInitTxId = await sendAndConfirmTransaction(connection, poolInitCreateTx, [adminKeypair]);
            // console.log("Pool initialization txId:", poolInitTxId);
            
            await sleep(2000);
        
            // Now proceed with LP creation
            console.log("Starting LP creation...");
            const lpTx = await createLPIx(new PublicKey(mint.publicKey), adminKeypair.publicKey);
            const createTx = new Transaction().add(lpTx.ix);
            createTx.feePayer = adminWallet.publicKey;
            createTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            // console.log("Simulating transaction before sending...");
            const simulation = await connection.simulateTransaction(createTx);
            if (simulation.value.err) {
                console.error("Transaction simulation failed:", simulation.value.err);
                console.error("Simulation logs:", simulation.value.logs);
                throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
            }
            // console.log("Simulation successful");

            const txId = await sendAndConfirmTransaction(connection, createTx, [adminKeypair], {
                skipPreflight: true,
                commitment: 'confirmed'
            });
            // console.log("LP transaction successful, txId:", txId);

            // Database operations
            const urlSeg = data.url.split('/');
            const gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
            const url = `${gatewayUrl}/${urlSeg[urlSeg.length - 1]}`;
            // console.log('Constructed URL:', url);
            const tokenAddress = mint.publicKey.toString()

            const newCoin = new Coin({
                creator: data.creator,
                name: data.name,
                ticker: data.ticker,
                description: data.description,
                token: tokenAddress,
                url,
                isMigrated: false,
            });
           // console.log("Saving coin to database:", newCoin);

            const response = await newCoin.save();
            // console.log("Coin saved successfully");

            const newCoinStatus = new CoinStatus({
                coinId: response._id,
                record: [
                    {
                        holder: response.creator,
                        holdingStatus: 2,
                        amount: 0,
                        tx: txId,
                        price: INITIAL_PRICE / 1000
                    }
                ]
            });
            await newCoinStatus.save();
            // console.log("Coin status saved successfully");

            return response;
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("LP Creation failed:", err.message);
                if ('logs' in err) {
                    console.error("Program logs:", (err as any).logs);
                }
            } else {
                console.error("LP Creation failed with unknown error:", err);
            }
            return "transaction failed"
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Token creation failed:", err.message);
            if ('logs' in err) {
                console.error("Program logs:", (err as any).logs);
            }
        } else {
            console.error("Token creation failed with unknown error:", err);
        }
        return "token creation failed"
    }
}

// check transaction
export const checkTransactionStatus = async (transactionId: string) => {
    try {
        // Fetch the transaction details using the transaction ID
        const transactionResponse: TransactionResponse | null = await connection.getTransaction(transactionId);

        // If the transactionResponse is null, the transaction is not found
        if (transactionResponse === null) {
            console.log(`Transaction ${transactionId} not found.`);
            return false;
        }

        // Check the status of the transaction
        if (transactionResponse.meta && transactionResponse.meta.err === null) {
            return true;
        } else {
            console.log(`Transaction ${transactionId} failed with error: ${transactionResponse.meta?.err}`);
            return false
        }
    } catch (error) {
        console.error(`Error fetching transaction ${transactionId}:`, error);
        return false;
    }
}

const processedSignatures = new Set<string>(); // Track already processed transactions

connection.onLogs(PROGRAM_ID, async (logs, ctx) => {
    if (logs.err !== null) {
        return;
    }
    console.log("log1:", logs.logs[1])
    if (processedSignatures.has(logs.signature) || logs.signature === "1111111111111111111111111111111111111111111111111111111111111111") {
        return;
    }
    processedSignatures.add(logs.signature);
    // IF SWAP BUY OR SELL - Do this.
    if (logs.logs[1].includes('Swap')) {
        const parsedData: ResultType = parseLogs(logs.logs, logs.signature);
        await setCoinStatus(parsedData);
    
        console.log('Current reserves:', {
            solReserve: parsedData.reserve2 / 1e9,
            willMigrate: parsedData.reserve2 > willMigrateAt
        });

        if (parsedData.reserve2 > willMigrateAt) {
            console.log('🚀 Migration threshold reached! Moving to Raydium...');
            try {
                await createRaydium(new PublicKey(parsedData.mint), parsedData.reserve1, parsedData.reserve2);
            } catch (error:any) {
                console.error('Migration failed:', error);
            }
            return;
        }
    }
    if (logs.logs[1].includes('RemoveLiquidity')) {
        const tx = logs.signature
        const result: ResultType = {
            tx,
            mint: '',
            owner: '',
            swapType: 1,
            swapAmount: 0,
            reserve1: 0,
            reserve2: 0,
            name: "",
            ticker: "",
            description: "",
            url: "",
            creator: null,
            isMigrated: true,
        };
        await setCoinStatus(result);
        return;
    }
    
});

// Remove liquidity pool and Create Raydium Pool
export const createRaydium = async (mint1: PublicKey, r1: number, r2: number) => {
    console.log('Starting Raydium migration for token:', mint1.toBase58());

        // Check wallet balance first
        const balance = await connection.getBalance(adminKeypair.publicKey);
        const requiredBalance = 5_000_000_000; // 5 SOL to be safe
        
        if (balance < requiredBalance) {
            throw new Error(`Insufficient SOL balance. Have: ${balance/1e9} SOL, Need: ${requiredBalance/1e9} SOL`);
        }

    const amountOne = r1;    // tokens to raydium
    const amountTwo = r2 - ourFeeToKeep;   // sol to raydium minus fee
    // 🔹 Fetch remove liquidity instructions (returns structured output)
    const removeLiquidityTX = await removeLiquidityIx(mint1, adminKeypair.publicKey);

    const tx = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 })
    );
    tx.add(removeLiquidityTX.ixs[0])

    tx.feePayer = adminKeypair.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // ✅ Simulate transaction before sending
    console.log("🔹 Simulating Transaction...");
    await simulateTransaction(connection, tx);

    // ✅ Send transaction with preflight check
    const sig = await sendAndConfirmTransaction(connection, tx, [adminKeypair], {
        commitment: "finalized", // Ensures transaction is fully confirmed
    });
    console.log("✅ LIQUIDITY REMOVED!");

    await sleep(20000)
    const marketId = await createMarket(mint1)
    // const marketId = "483bWr1PkiktzjSfRLqrv9VM6g6tDsSETJf8NruUQdna"
    wrapSOLToWSOL(connection, adminKeypair, amountTwo )
    await sleep(20000)
    const poolAddress = await createAmmPool(mint1, marketId, amountOne, amountTwo)
    console.log("✅ Migration to Raydium Complete!");
 
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get swap(buy and sell)
function parseLogs(logs: string[], tx: string): ResultType {
    // console.log("📜 Raw logs received:", logs);

    const result: ResultType = {
        tx,
        mint: '',
        owner: '',
        swapType: 0,
        swapAmount: 0,
        reserve1: 0,
        reserve2: 0,
        name: "",
        ticker: "",
        description: "",
        url: "",
        creator: null,
        isMigrated: false,
    };

    logs.forEach((log: string) => {
        if (log.includes('SwapData:') || log.includes('RemovalData:')) {
            const isRemoval = log.includes('RemovalData:');
    
            const data = log
                .replace(/Program log: (SwapData|RemovalData): /, "")
                .split(", ")
                .reduce<Record<string, string>>((acc, entry) => {
                    const [key, value] = entry.split(": ");
                    acc[key.trim()] = value ? value.trim() : "";
                    return acc;
                }, {});
    
            result.mint = data.Mint || '';
            result.swapAmount = parseInt(data.Amount) || 0;
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



export interface CoinInfo {
    creator?: Types.ObjectId;
    name: string;
    ticker: string;
    url: string;
    description?: string;
    token?: string;
    reserve1?: number;
    reserve2?: number;
}

export interface ResultType {
    name: string;
    ticker: string;
    description: string;
    url: string;
    creator: null;
    tx: string;
    mint: string;
    owner: string;
    swapType: number;
    swapAmount: number;
    reserve1: number;
    reserve2: number;
    isMigrated: boolean;
}