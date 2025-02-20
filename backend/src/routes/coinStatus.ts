import CoinStatus from "../models/CoinsStatus";
import { ResultType } from "../program/web3";
import Coin from "../models/Coin";
import User from "../models/User";
import { INITIAL_PRICE, PRICE_INCREMENT, PRICE_INCREMENT_STEP, totalSupply } from "../config/config";


export const setCoinStatus = async (data: ResultType) => {
    const coinId = await Coin.findOne({ token: data.mint }).select('_id');
    const userId = await User.findOne({ wallet: data.owner }).select('_id');

    const solAmount = data.reserve2 / 1e9; // Convert SOL from lamports (9 decimals)
    const tokenAmount = data.reserve1 / 1e6; // Convert tokens from raw amount (6 decimals)

    const tokensSold = totalSupply - data.reserve1;
    const priceStep = tokensSold / PRICE_INCREMENT_STEP;
    const priceInSol = (INITIAL_PRICE + (priceStep * PRICE_INCREMENT)) / 1000;

    const newTx = {
        holder: userId?._id,
        holdingStatus: data.swapType,
        amount: data.swapAmount,
        tx: data.tx,
        price: priceInSol,
        time: new Date() // Add timestamp if required for tracking
    };

    console.log('Price calculation:', {
        solReserve: solAmount,
        tokenReserve: tokenAmount,
        calculatedPrice: priceInSol
    });

    // Update transaction record
    await CoinStatus.findOneAndUpdate(
        { coinId: coinId?._id },
        { $push: { record: newTx } },
        { new: true, upsert: true }
    );

    const tokenAddress = data.mint ? data.mint.trim() : "UNDEFINED";
    console.log("🔍 Querying MongoDB for token:", tokenAddress);

    if (tokenAddress === "UNDEFINED") {
        console.error("❌ `data.mint` is undefined! Fix this.");
        return;
    }

    const updateCoin = await Coin.findOneAndUpdate(
        { token: tokenAddress },
        { 
            $set: {
                reserveOne: data.reserve1,
                reserveTwo: data.reserve2,
                date: new Date(),
                isMigrated: data.isMigrated,
            }
        },
        { new: true, upsert: true }
    );

    if (!updateCoin) {
        console.error(`❌ Token not found in MongoDB: [${tokenAddress}]`);
    } else {
        console.log("✅ Updated coin reserves")  //, updateCoin);
    }
};


