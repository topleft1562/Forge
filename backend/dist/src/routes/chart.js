"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../sockets/logger");
const chart_1 = require("../utils/chart");
const router = express_1.default.Router();
// @route   GET /coin/
// @desc    Get all created coins
// @access  Public
router.get('/:pairIndex/:start/:end/:range/:token', async (req, res) => {
    console.log("config+++");
    const { pairIndex, start, end, range, token } = req.params;
    logger_1.logger.info(`  get charts for pairIndex: ${pairIndex}, start: ${start}, end: ${end}, range: ${range}, token: ${token}`);
    try {
        const data = await (0, chart_1.fetchPriceChartData)(parseInt(pairIndex), parseInt(start) * 1000, parseInt(end) * 1000, parseInt(range), token);
        return res.status(200).send({ table: data });
    }
    catch (e) {
        console.error(e);
        return res.status(500).send({});
    }
});
exports.default = router;
