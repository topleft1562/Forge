"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calculateTokenPrice_1 = require("../utils/calculateTokenPrice");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const solPrice = await (0, calculateTokenPrice_1.fetchSolPrice)();
        return res.json({ price: solPrice });
    }
    catch (error) {
        console.error("Error fetching price:", error);
        return res.status(500).json({ error: "Failed to fetch SOL price" });
    }
});
exports.default = router;
