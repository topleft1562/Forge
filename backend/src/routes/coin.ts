import express from "express";
import Joi from "joi";
import Coin from "../models/Coin";
import { cancelCoin, createToken } from "../program/web3";
import { deleteCoinMessagesTrades } from "./coinStatus";
import User from "../models/User";
import { fetchSolPrice } from "../utils/calculateTokenPrice";



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
            telegram: Joi.string().allow('', null),
            website: Joi.string().allow('', null),
            reserveOne: Joi.number().default(0),    // Add this line
            reserveTwo: Joi.number().default(0),    // Add this line
            token: Joi.string().allow('', null),     // Add this line
            autoMigrate: Joi.boolean().required(),
        });
        // console.log(UserSchema)
        const inputValidation = UserSchema.validate(body);
        if (inputValidation.error) {
            return res.status(400).json({ error: inputValidation.error.details[0].message });
        }
        const creator = await User.findOne({_id: req.body.creator})

        // Create Token with UMI
        const token = await createToken({
            name: req.body.name,
            ticker: req.body.ticker,
            url: req.body.url,
            creator: req.body.creator,
            description: req.body.description,
            twitter: req.body.twitter,
            telegram: req.body.telegram,
            website: req.body.website,
            autoMigrate: req.body.autoMigrate
            
        },creator?.wallet);

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

router.get('/cancel/:tokenAddress', async(req, res) => {
    try {
        
        const tokenAddress = req.params.tokenAddress;
        await cancelCoin(tokenAddress)
        await deleteCoinMessagesTrades(tokenAddress)   
        return res.status(200).send(tokenAddress);
    } catch (error) {
        console.error("Error deleteing coins:", error);
        return res.status(500).send(error);
    }
})


export default router;
