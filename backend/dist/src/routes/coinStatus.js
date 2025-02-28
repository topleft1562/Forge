"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoinMessagesTrades = exports.setCoinStatus = void 0;
const CoinsStatus_1 = __importDefault(require("../models/CoinsStatus"));
const Coin_1 = __importDefault(require("../models/Coin"));
const User_1 = __importDefault(require("../models/User"));
const Feedback_1 = __importDefault(require("../models/Feedback"));
const setCoinStatus = async (data) => {
    const coin = await Coin_1.default.findOne({ token: data.mint }).select("_id");
    const user = await User_1.default.findOne({ wallet: data.owner }).select("_id holdings");
    if (!coin || !user) {
        console.log("User or coin not found");
        return;
    }
    const userHolding = user.holdings.find(h => h.coinId.toString() === coin._id.toString());
    console.log(userHolding);
    let newAmount = userHolding ? userHolding.amount : 0;
    if (data.swapType === 0) {
        newAmount += data.swapAmountOut;
    }
    else if (data.swapType === 1) {
        newAmount -= data.swapAmount;
    }
    console.log(`🔄 Updating user holdings: New Amount = ${newAmount}`);
    if (newAmount <= 0) {
        await User_1.default.findOneAndUpdate({ wallet: data.owner }, { $pull: { holdings: { coinId: coin._id } } }, { new: true });
        console.log("❌ Holding removed (amount reached 0)");
    }
    else if (userHolding) {
        await User_1.default.findOneAndUpdate({ wallet: data.owner, "holdings.coinId": coin._id }, { $set: { "holdings.$.amount": newAmount } }, { new: true, upsert: true });
        console.log("✅ User holding updated:", data.owner);
    }
    else {
        await User_1.default.findOneAndUpdate({ wallet: data.owner }, { $push: { holdings: { coinId: coin._id, amount: newAmount } } }, { new: true });
        console.log("🆕 New holding added:", data.owner, coin._id);
    }
    const newTx = {
        holder: user._id,
        holdingStatus: data.swapType,
        amount: data.swapAmount,
        amountOut: data.swapAmountOut,
        tx: data.tx,
        price: data.price,
        time: new Date()
    };
    await CoinsStatus_1.default.findOneAndUpdate({ coinId: coin._id }, { $push: { record: newTx } }, { new: true, upsert: true });
    // ✅ Update token data
    const tokenAddress = data.mint?.trim() || "UNDEFINED";
    if (tokenAddress === "UNDEFINED") {
        console.error("❌ `data.mint` is undefined! Fix this.");
        return;
    }
    const updateCoin = await Coin_1.default.findOneAndUpdate({ token: tokenAddress }, {
        $set: {
            reserveOne: data.reserve1,
            reserveTwo: data.reserve2,
            lastPrice: data.price,
            date: new Date(),
            isMigrated: data.isMigrated,
        }
    }, { new: true, upsert: true });
    if (!updateCoin) {
        console.error(`❌ Token not found in MongoDB: [${tokenAddress}]`);
    }
    else {
        console.log("✅ Updated coin reserves");
    }
};
exports.setCoinStatus = setCoinStatus;
const deleteCoinMessagesTrades = async (tokenAddress) => {
    const coinId = await Coin_1.default.findOne({ token: tokenAddress }).select('_id');
    // delete coin with this id
    const deleteCoin = await Coin_1.default.deleteOne({ _id: coinId });
    console.log(deleteCoin);
    if (deleteCoin.acknowledged) {
        console.log("success");
    }
    else {
        console.log("failed?");
    }
    const deleteTrades = await CoinsStatus_1.default.deleteOne({ coinId: coinId });
    console.log(deleteTrades);
    if (deleteTrades.acknowledged) {
        console.log("success");
    }
    else {
        console.log("failed?");
    }
    const deleteMsgs = await Feedback_1.default.deleteOne({ coinId: coinId });
    console.log(deleteMsgs);
    if (deleteMsgs.acknowledged) {
        console.log("success");
    }
    else {
        console.log("failed?");
    }
};
exports.deleteCoinMessagesTrades = deleteCoinMessagesTrades;
