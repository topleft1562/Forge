import express from "express";
import Joi, { string } from "joi";
import Coin from "../models/Coin";
import { AuthRequest, auth } from "../middleware/authorization";
import { createToken, swapTx } from "../program/web3";
import { Types } from "mongoose";
import { Keypair, PublicKey } from "@solana/web3.js";
import CoinStatus from "../models/CoinsStatus";


const router = express.Router();

// @route   GET /coin/
// @desc    Get all created coins
// @access  Public
router.get('/', async (req, res) => {
    // console.log("GET /coin route hit"); // Add this line
    try {
        const coins = await Coin.find({}).populate('creator');
        // console.log("Found coins:", coins); // Add this line
        return res.status(200).send(coins);
    } catch (error) {
        console.error("Error fetching coins:", error); // Add this line
        return res.status(500).send(error);
    }
})
// @route   GET /coin/:userID
// @desc    Get coins created by userID
// @access  Public
router.get('/:id', (req, res) => {
    const id = req.params.id;
    Coin.findOne({ _id: id }).populate('creator').then(users => res.status(200).send(users)).catch(err => res.status(400).json('Nothing'))
})


// @route   GET /coin/user/:userID
// @desc    Get coins created by userID
// @access  Public
router.get('/user/:userID', (req, res) => {
    const creator = req.params.userID;
    Coin.find({ creator }).populate('creator').then(users => res.status(200).send(users)).catch(err => res.status(400).json('Nothing'))
})

// @route   POST /coin
// @desc    Create coin
// @access  Public
router.post('/', async (req, res) => {
    try {
        console.log("++++++++Create coin++++++++++", req.body.creator);
        const { body } = req;
        const UserSchema = Joi.object().keys({
            creator: Joi.string().required(),
            name: Joi.string().required(),
            ticker: Joi.string().required(),
            description: Joi.string().allow('', null),
            url: Joi.string().required(),
            twitter: Joi.string().allow('', null),  // Add this line
            reserveOne: Joi.number().default(0),    // Add this line
            reserveTwo: Joi.number().default(0),    // Add this line
            token: Joi.string().allow('', null)     // Add this line
        });
        // console.log(UserSchema)
        const inputValidation = UserSchema.validate(body);
        if (inputValidation.error) {
            return res.status(400).json({ error: inputValidation.error.details[0].message });
        }

        // Create Token with UMI
        const token = await createToken({
            name: req.body.name,
            ticker: req.body.ticker,
            url: req.body.url,
            creator: req.body.creator,
            description: req.body.description,
        });

        console.log("token====", token);
        
        if (token === "transaction failed") {
            return res.status(400).json({ error: "Transaction failed" });
        }

        // Uncomment these if you need to check for existing coins
        // const name = body.name;
        // const coinName = await Coin.findOne({ name })
        // if (coinName) return res.status(400).json("Name is invalid")
        // const coinData = await Coin.findOne({ token })
        // if (coinData) return res.status(400).json("This coin is already created.")

        return res.status(200).json(token);
    } catch (error) {
        console.error('Error creating coin:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// @route   POST /coin/:coinId
// @desc    Update coin
// @access  Public
router.post('/:coinId', (req, res) => {
    const { body } = req;
    const coinId = req.params.coinId;
    Coin.updateOne({ _id: coinId }, { $set: body })
        .then((updateCoin) => {
            console.log(updateCoin)
            res.status(200).send(updateCoin)
        })
        .catch(err => res.status(400).json("update is failed!!"));
})

export default router;
