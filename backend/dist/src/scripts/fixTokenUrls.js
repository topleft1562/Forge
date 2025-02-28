"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Coin_1 = __importDefault(require("../models/Coin"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const fixTokenUrls = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        const gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
        // Find all coins with 'undefined' in their URLs
        const coins = await Coin_1.default.find({ url: /undefined/ });
        console.log(`Found ${coins.length} coins to update`);
        for (const coin of coins) {
            if (!coin.url) {
                console.log(`Skipping coin ${coin.name} (${coin._id}) - No URL found`);
                continue;
            }
            const oldUrlSegments = coin.url.split('/');
            const ipfsHash = oldUrlSegments[oldUrlSegments.length - 1];
            const newUrl = `${gatewayUrl}/${ipfsHash}`;
            console.log(`
                Coin: ${coin.name} (${coin._id})
                Old URL: ${coin.url}
                New URL: ${newUrl}
                ----------------------
            `);
            // Uncomment this line to perform the actual update:
            await Coin_1.default.findByIdAndUpdate(coin._id, { url: newUrl });
        }
        //console.log('Dry run completed! No changes were made.');
        console.log('URL fixes completed!'); // Uncomment when ready to make actual changes
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Error in script:', error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
};
fixTokenUrls();
