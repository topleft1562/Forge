import express from 'express';
import CoinStatus from '../models/CoinsStatus';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

const router = express.Router();

router.get('/:id', async (req, res) => {
    const coinId = req.params.id;
    try {
        const coinTrade = await CoinStatus.findOne({ coinId })
            .populate('coinId')
            .populate('record.holder');

        if (!coinTrade) {
            return res.status(404).send({ message: 'Coin not found' });
        }

        res.status(200).send(coinTrade);
    } catch (error) {
        res.status(500).send(error);
    }
});


export default router;
