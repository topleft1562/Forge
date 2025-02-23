// models/Coin.js
import { number, required } from 'joi';
import mongoose from 'mongoose';

const coinStatusSchema = new mongoose.Schema({
    coinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coin', required: true },
    record: [{
        holder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        holdingStatus: { type: Number, required: true },
        time: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        amountOut: { type: String },
        price: { type: String },
        tx: { type: String, required: true }
    }
    ]
});

const CoinStatus = mongoose.model('CoinStatus', coinStatusSchema);

export default CoinStatus;
