"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const Coin_1 = __importDefault(require("../models/Coin"));
const web3_1 = require("../program/web3");
const coinStatus_1 = require("./coinStatus");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// @route   GET /coin/
// @desc    Get all created coins
// @access  Public
router.get('/', async (req, res) => {
    // console.log("GET /coin route hit"); // Add this line
    try {
        const coins = await Coin_1.default.find({}).populate('creator');
        // console.log("Found coins:", coins); // Add this line
        return res.status(200).send(coins);
    }
    catch (error) {
        console.error("Error fetching coins:", error); // Add this line
        return res.status(500).send(error);
    }
});
// @route   GET /coin/:userID
// @desc    Get coins created by userID
// @access  Public
router.get('/:id', (req, res) => {
    const id = req.params.id;
    Coin_1.default.findOne({ _id: id }).populate('creator').then(users => res.status(200).send(users)).catch(err => res.status(400).json('Nothing'));
});
// @route   GET /coin/user/:userID
// @desc    Get coins created by userID
// @access  Public
router.get('/user/:userID', (req, res) => {
    const creator = req.params.userID;
    Coin_1.default.find({ creator }).populate('creator').then(users => res.status(200).send(users)).catch(err => res.status(400).json('Nothing'));
});
// @route   POST /coin
// @desc    Create coin
// @access  Public
router.post('/', async (req, res) => {
    try {
        console.log("++++++++Create coin++++++++++", req.body.creator);
        const { body } = req;
        const UserSchema = joi_1.default.object().keys({
            creator: joi_1.default.string().required(),
            name: joi_1.default.string().required(),
            ticker: joi_1.default.string().required(),
            description: joi_1.default.string().allow('', null),
            url: joi_1.default.string().required(),
            twitter: joi_1.default.string().allow('', null), // Add this line
            telegram: joi_1.default.string().allow('', null),
            website: joi_1.default.string().allow('', null),
            reserveOne: joi_1.default.number().default(0), // Add this line
            reserveTwo: joi_1.default.number().default(0), // Add this line
            token: joi_1.default.string().allow('', null), // Add this line
            autoMigrate: joi_1.default.boolean().required(),
        });
        // console.log(UserSchema)
        const inputValidation = UserSchema.validate(body);
        if (inputValidation.error) {
            return res.status(400).json({ error: inputValidation.error.details[0].message });
        }
        const creator = await User_1.default.findOne({ _id: req.body.creator });
        // Create Token with UMI
        const token = await (0, web3_1.createToken)({
            name: req.body.name,
            ticker: req.body.ticker,
            url: req.body.url,
            creator: req.body.creator,
            description: req.body.description,
            twitter: req.body.twitter,
            telegram: req.body.telegram,
            website: req.body.website,
            autoMigrate: req.body.autoMigrate
        }, creator?.wallet);
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
    }
    catch (error) {
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
    Coin_1.default.updateOne({ _id: coinId }, { $set: body })
        .then((updateCoin) => {
        console.log(updateCoin);
        res.status(200).send(updateCoin);
    })
        .catch(err => res.status(400).json("update is failed!!"));
});
router.get('/cancel/:tokenAddress', async (req, res) => {
    try {
        const tokenAddress = req.params.tokenAddress;
        await (0, web3_1.cancelCoin)(tokenAddress);
        await (0, coinStatus_1.deleteCoinMessagesTrades)(tokenAddress);
        return res.status(200).send(tokenAddress);
    }
    catch (error) {
        console.error("Error deleteing coins:", error);
        return res.status(500).send(error);
    }
});
exports.default = router;
