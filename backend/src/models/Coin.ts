// models/Coin.js
import mongoose from 'mongoose';
import { initialSOL, totalSupply } from '../config/config';

const coinSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, },
    ticker: { type: String, required: true, },
    description: { type: String },
    token: { type: String, },
    reserveOne: { type: Number, default: totalSupply },
    reserveTwo: { type: Number, default: initialSOL },
    isMigrated: { type: Boolean, default: false},
    lastPrice: {type: String},
    url: { type: String, requried: true },
    twitter: { type: String },
    telegram: {type: String },
    website: { type: String },
    date:{type:Date, default:new Date},
    autoMigrate:{type: Boolean,default: true}
});

const Coin = mongoose.model('Coin', coinSchema);

export default Coin;
