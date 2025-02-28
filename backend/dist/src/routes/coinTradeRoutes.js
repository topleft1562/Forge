"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CoinsStatus_1 = __importDefault(require("../models/CoinsStatus"));
const router = express_1.default.Router();
router.get('/:id', async (req, res) => {
    const coinId = req.params.id;
    try {
        const coinTrade = await CoinsStatus_1.default.findOne({ coinId })
            .populate('coinId')
            .populate('record.holder');
        if (!coinTrade) {
            return res.status(404).send({ message: 'Coin not found' });
        }
        res.status(200).send(coinTrade);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.default = router;
