// routes/users.js
import express from 'express';
import User from '../models/User';
import PendingUser from '../models/PendingUser';
import crypto from 'crypto'
import Joi from 'joi';
import base58 from 'bs58';
import nacl from 'tweetnacl';
import { PublicKey, Transaction } from '@solana/web3.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


const router = express.Router();

// At the top of the file, after imports
router.use((req, res, next) => {
    console.log(`User route hit: ${req.method} ${req.path}`);
    next();
});


// @route   POST api/users
// @desc    Resgister user
// @access  Public
router.post('/', async (req, res) => {
    console.log("wallet connect")
    // Validate form
    const { body } = req;
    const UserSchema = Joi.object().keys({
        name: Joi.string().required(),
        wallet: Joi.string().required(),
        isLedger: Joi.boolean().optional().required(),
    })
    const inputValidation = UserSchema.validate(body);
    if (inputValidation.error) {
        return res.status(400).json({ error: inputValidation.error.details[0].message })
    }
    const wallet = body.wallet;
    const userData = await User.findOne({ wallet });
    console.log("userdata:", userData)
    console.log(!userData == false)
    if (!userData == false) return res.status(200).send(userData);
    const exisitingPendingUser = await PendingUser.findOne({ wallet })
    console.log("pending:", exisitingPendingUser)
    if (exisitingPendingUser == null) {
        const nonce = crypto.randomBytes(8).toString('hex');
        const newPendingUser = new PendingUser({ name: body.name, wallet, nonce, isLedger: body.isLedger });
        console.log("newPendingUser::", newPendingUser)
        newPendingUser.save().then((user: PendingUserInfo) => {
            res.status(200).send(user)
        });
    } else {
        res.status(400).json({ message: "A user with this wallet already requested." });
    }
});

// @route   POST api/users/login
// @desc    Resgister user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        // console.log(req.body)
        const { wallet } = req.body;
        const user = await User.findOne({ wallet })
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        } else {
           // console.log(user)
            const token = jwt.sign({
                id: user._id,
                name: user.name,
                wallet
            }, 'secret',
                {
                    algorithm: 'HS256',
                    expiresIn: '60m',
                })
            return res.status(200).json({ token });
        }
    } catch (error) {
        res.status(500).json({ error })
    }
})

// @route   POST api/users/:nonce
// @desc    Confirm and Register user
// @access  Public
router.post('/confirm', async (req, res) => {
    console.log("req.body:::", req.body)
    const body = {
        name: req.body.name,
        wallet: req.body.wallet,
        isLedger: req.body.isLedger,
        signature: req.body.signature,
        nonce: req.body.nonce,
    }
    // Validate form
    const UserSchema = Joi.object().keys({
        name: Joi.string().required(),
        wallet: Joi.string().required(),
        nonce: Joi.string().required(),
        signature: Joi.string().required(),
        isLedger: Joi.boolean().optional().required(),
    })
    const inputValidation = UserSchema.validate(body);
    // console.log(inputValidation)
    if (inputValidation.error) {
        return res.status(400).json({ error: inputValidation.error.details[0].message })
    }
    console.log("validation OK")
    const foundNonce = await PendingUser.findOneAndDelete({ nonce: body.nonce }).exec();
    if (foundNonce == null) return res.status(400).json("Your request expired")

    // nonce  decode!!
    if (!body.isLedger) {
        const signatureUint8 = base58.decode(body.signature);
        const msgUint8 = new TextEncoder().encode(`${process.env.SIGN_IN_MSG} ${foundNonce.nonce}`);
        const pubKeyUint8 = base58.decode(body.wallet);
        const isValidSignature = nacl.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8);
        // const isValidSignature = true;
        if (!isValidSignature) return res.status(404).json({ error: "Invalid signature" })
    } else {
        const ledgerSerializedTx = JSON.parse(body.signature);
        const signedTx = Transaction.from(Uint8Array.from(ledgerSerializedTx));

        const feePayer = signedTx.feePayer?.toBase58() || "";

        if (feePayer != body.wallet) {
            return res.status(400).json({ error: "Invalid wallet or fee payer" });
        }

        const MEMO_PROGRAM_ID = new PublicKey(
            "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        );

        const inx = signedTx.instructions.find(
            (ix) => ix.programId.toBase58() == MEMO_PROGRAM_ID.toBase58()
        );

        if (!inx) {
            return res
                .status(503)
                .json({ error: "Memo program couldn't be verified" });
        }

        if (!signedTx.verifySignatures()) {
            return res
                .status(503)
                .json({ error: "Could not verify signatures" });
        }
    }
    const userData = {
        name: body.name,
        wallet: body.wallet
    }
    const newUser = new User(userData);
    await newUser.save().then((user: UserInfo) => res.status(200).send(user))
});

// GET: Fetch all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// GET: Fetch a user with fully populated holdings & full Coin details
router.get('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // ✅ Find the user and fully populate `holdings.coinId`
        const user = await User.findOne({ _id: userId }).populate('holdings.coinId'); // Fetches full coin details

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});


router.post('/update/:userId', (req, res) => {
    const { body } = req;
    const userId = req.params.userId;
    User.updateOne({ _id: userId }, { $set: body })
        .then((updateUser) => {
            console.log(updateUser)
            res.status(200).send(updateUser)
        })
        .catch(err => res.status(400).json("update is failed!!"));
})


export const checkAnonymousUser = async () => {
    try {
        const anonymousUser = await User.findOne({ name: "anonymous" });

        if (!anonymousUser) {
            console.log("Anonymous user not found. Creating one...");
            const newUser = new User({
                _id: new mongoose.Types.ObjectId("999999999999999999999999"), // Manually set the ID
                name: "anonymous",
                wallet: "An0N",
                avatar: "https://gateway.pinata.cloud/ipfs/undefined",
            });

            await newUser.save();
            console.log("Anonymous user created successfully.");
        } else {
            console.log("Anonymous user already exists.");
        }
    } catch (error) {
        console.error("Error checking/creating anonymous user:", error);
    }
};



export default router;

export interface UserInfo {
    name: string,
    wallet: string,
    avatar?: string
}

export interface PendingUserInfo {
    name: string,
    wallet: string,
    nonce: string,
}