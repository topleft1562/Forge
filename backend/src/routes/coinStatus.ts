import CoinStatus from "../models/CoinsStatus";
import { ResultType } from "../program/web3";
import Coin from "../models/Coin";
import User from "../models/User";
import Feedback from "../models/Feedback"


export const setCoinStatus = async (data: ResultType) => {
    const coinId = await Coin.findOne({ token: data.mint }).select('_id');
    const userId = await User.findOne({ wallet: data.owner }).select('_id');

    const solAmount = data.reserve2 / 1e9; // Convert SOL from lamports (9 decimals)
    const tokenAmount = data.reserve1 / 1e6; // Convert tokens from raw amount (6 decimals)

    const newTx = {
        holder: userId?._id,
        holdingStatus: data.swapType,
        amount: data.swapAmount,
        amountOut: data.swapAmountOut,
        tx: data.tx,
        price: data.price,
        time: new Date() // Add timestamp if required for tracking
    };

    console.log('Price calculation:', {
        solReserve: solAmount,
        tokenReserve: tokenAmount,
        calculatedPrice: data.price
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
                lastPrice: data.price,
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

export const deleteCoinMessagesTrades = async (tokenAddress: string) => {
    const coinId = await Coin.findOne({ token: tokenAddress }).select('_id');
    // delete coin with this id
    const deleteCoin = await Coin.deleteOne({_id: coinId})
    console.log(deleteCoin)
    if(deleteCoin.acknowledged) {
        console.log("success")
    } else {
        console.log("failed?")
    }
    const deleteTrades = await CoinStatus.deleteOne({coinId: coinId})
    console.log(deleteTrades)
    if(deleteTrades.acknowledged) {
        console.log("success")
    } else {
        console.log("failed?")
    }
    const deleteMsgs = await Feedback.deleteOne({coinId: coinId})
    console.log(deleteMsgs)
    if(deleteMsgs.acknowledged) {
        console.log("success")
    } else {
        console.log("failed?")
    }
};


