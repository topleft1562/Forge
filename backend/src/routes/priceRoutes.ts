import express from 'express';
import { fetchSolPrice } from '../utils/calculateTokenPrice';
import { addLiquidityRaydium, createAmmPool, createMarket } from '../program/web3Provider';
import { PublicKey } from '@solana/web3.js';

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

router.get('/test', async (req, res) => {
    const mint1 = new PublicKey("BmcdaP1cjeBsp5bdBW6VGSJ9QW1nfo8LW5bX8D7gFUbx")
    const marketId = "9RJvGh9WZf3BmagtsnQLhwCxukigg57mAjMuDTzzn17C" // this is real
    const poolId = "3W8D2iZ73d3viZjuh2PLLchbihxCgSL8isFHH12Lv4bF"

    // await createMarket(mint1) // this did work
    await createAmmPool(mint1, marketId, 100000, 100000)
    // await addLiquidityRaydium(poolId, 100000, 100000)
    
})
// 999996464307592 && 30099000
export default router;
