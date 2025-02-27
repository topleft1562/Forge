// models/User.js
import mongoose, { Types } from 'mongoose';

const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL;
const defualtImg = process.env.DEFAULT_IMG_HASH

const holdingSchema = new mongoose.Schema({
  coinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coin', required: true },
  amount: { type: Number, required: true, default: 0 }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  wallet: { type: String, required: true, unique: true },
  avatar: { type: String, default: `${PINATA_GATEWAY_URL}/${defualtImg}` },
  holdings: { type: [holdingSchema], default: [] }
});

const User = mongoose.model('User', userSchema);

export default User;