import CoinStatus from "../models/CoinsStatus";
import { ResultType } from "../program/web3";
import Coin from "../models/Coin";
import User from "../models/User";
import Feedback from "../models/Feedback"


export const setCoinStatus = async (data: ResultType) => {
    const coin = await Coin.findOne({ token: data.mint }).select("_id");
    const user = await User.findOne({ wallet: data.owner }).select("_id holdings");

    if (!coin || !user) {
        console.log("User or coin not found");
        return;
    }

    // ✅ Get the specific holding
    const userHolding = user.holdings.find(h => h.coinId.toString() === coin._id.toString());

    let newAmount = userHolding ? userHolding.amount : 0;

    // ✅ Swap type logic
    if (data.swapType === 0) {
        newAmount += data.swapAmountOut;
    } else if (data.swapType === 1) {
        newAmount -= data.swapAmount;
    }

    console.log(`🔄 Updating user holdings: New Amount = ${newAmount}`);

    if (newAmount <= 0) {
        // ✅ Remove the holding if the amount is zero
        await User.findOneAndUpdate(
            { wallet: data.owner },
            { $pull: { holdings: { coinId: coin._id } } }, // ✅ Uses the correct coinId
            { new: true }
        );
        console.log("❌ Holding removed (amount reached 0)");
    } else {
        // ✅ Update or add the holding
        await User.findOneAndUpdate(
            { wallet: data.owner, "holdings.coinId": coin._id },
            { $set: { "holdings.$.amount": newAmount } },
            { new: true, upsert: true }
        );
        console.log("✅ User holding updated:", data.owner);
    }

    // ✅ Store transaction history in CoinStatus
    const newTx = {
        holder: user._id,
        holdingStatus: data.swapType,
        amount: data.swapAmount,
        amountOut: data.swapAmountOut,
        tx: data.tx,
        price: data.price,
        time: new Date()
    };

    await CoinStatus.findOneAndUpdate(
        { coinId: coin._id },
        { $push: { record: newTx } },
        { new: true, upsert: true }
    );

    // ✅ Update token data
    const tokenAddress = data.mint?.trim() || "UNDEFINED";
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
        console.log("✅ Updated coin reserves");
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


