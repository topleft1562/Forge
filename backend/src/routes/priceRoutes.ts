import express from 'express';
import { fetchSolPrice } from '../utils/calculateTokenPrice';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const solPrice = await fetchSolPrice();
        return res.json({ price: solPrice });
    } catch (error) {
        console.error("Error fetching price:", error);
        return res.status(500).json({ error: "Failed to fetch SOL price" });
    }
});

export default router;
