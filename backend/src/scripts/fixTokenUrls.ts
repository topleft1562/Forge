import mongoose from 'mongoose';
import Coin from '../models/Coin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixTokenUrls = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        
        const gatewayUrl = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
        
        // Find all coins with 'undefined' in their URLs
        const coins = await Coin.find({ url: /undefined/ });
        
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
            await Coin.findByIdAndUpdate(coin._id, { url: newUrl });
        }
        
        //console.log('Dry run completed! No changes were made.');
        console.log('URL fixes completed!'); // Uncomment when ready to make actual changes
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error in script:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

fixTokenUrls();