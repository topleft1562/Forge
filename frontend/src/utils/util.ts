import axios, { AxiosRequestConfig } from 'axios'
import { coinInfo, msgInfo, replyInfo, userInfo } from './types';
import { FEE_PERCENTAGE, GROWTH_FACTOR, INITIAL_PRICE, PRICE_INCREMENT_STEP, SELL_REDUCTION, totalSupply } from '@/confgi';
import { Connection, Finality, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "@/contexts/ProgramProvider";
import { useWallet } from '@solana/wallet-adapter-react';


export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const config: AxiosRequestConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const test = async () => {
    const res = await fetch(`${BACKEND_URL}`);
    const data = await res.json();
    console.log(data)
}
export const getUser = async ({ id }: { id: string }): Promise<any> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/user/${id}`, config)
        // console.log("response:", response.data)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const updateUser = async (userId: string, data: userInfo) => {
    if (!data || Object.keys(data).length === 0) {
        return { error: "Data is empty or not defined" };
    }

    try {
        const response = await axios.post(
            `${BACKEND_URL}/user/update/${userId}`,
            data,
            { headers: { "Content-Type": "application/json" } }
        );
        return response.data;
    } catch (err: any) {
        console.error("Error updating user:", err.response?.data || err.message);
        return { error: err.response?.data?.error || "Error setting up the request" };
    }
};

export const walletConnect = async ({ data }: { data: userInfo }): Promise<any> => {
    try {
        // console.log("============walletConnect=========")
        const response = await axios.post(`${BACKEND_URL}/user/`, data)
        // console.log("==============response=====================", response.data, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}


// Revert back to the original version, just add error logging
export const confirmWallet = async ({ data }: { data: userInfo }): Promise<any> => {
    try {
        const response = await axios.post(`${BACKEND_URL}/user/confirm`, data, config)
        return response.data
    } catch (err) {
        console.error('Wallet confirmation failed:', err.response?.status, err.response?.data);
        return { error: "error setting up the request" }
    }
}

export const createNewCoin = async (data: coinInfo) => {
    try {
        // Ensure all required fields are present and properly formatted
        const coinData = {
            creator: data.creator,
            name: data.name.trim(),
            ticker: data.ticker.trim(),
            description: data.description || '',
            url: data.url,
            twitter: data.twitter || '',  // Optional
            reserveOne: 0,
            reserveTwo: 0
        };

        const response = await axios.post(`${BACKEND_URL}/coin/`, coinData, config);
        if (response.data.error) {
            throw new Error(response.data.error);
        }
        return response.data;
    } catch (err: any) {
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(err.response.data.error || "Failed to create coin");
        } else if (err.request) {
            // The request was made but no response was received
            throw new Error("No response from server");
        } else {
            // Something happened in setting up the request
            throw new Error(err.message || "Error setting up the request");
        }
    }
};

export const getCoinsInfo = async (): Promise<coinInfo[]> => {
    try {
        // console.log("Attempting to fetch coins from:", `${BACKEND_URL}/coin`);
        const res = await axios.get(`${BACKEND_URL}/coin`, config);
        // console.log("Coin response:", res.data);
        return res.data;
    } catch (error) {
        console.error("Error fetching coins:", error);
        if (axios.isAxiosError(error)) {
            console.error("Status:", error.response?.status);
            console.error("Data:", error.response?.data);
        }
        throw error;
    }
}
export const getCoinsInfoBy = async (id: string): Promise<coinInfo[]> => {

    const res = await axios.get<coinInfo[]>(`${BACKEND_URL}/coin/user/${id}`, config);
    return res.data
}
export const getCoinInfo = async (data: string): Promise<any> => {
    try {
        // console.log("coinINfo", data)
        const response = await axios.get(`${BACKEND_URL}/coin/${data}`, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const getUserInfo = async (data: string): Promise<any> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/user/${data}`, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const getMessageByCoin = async (data: string): Promise<msgInfo[]> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/feedback/coin/${data}`, config)
        console.log("messages:", response.data)
        return response.data
    } catch (err) {
        return [];
    }
}


export const getCoinTrade = async (data: string): Promise<any> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/cointrade/${data}`, config)
        // console.log("trade response::", response)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const postReply = async (data: replyInfo) => {
    // console.log("Sending data:", data);
    if (!data || Object.keys(data).length === 0) {
        return { error: "Data is empty or not defined" };
    }

    try {
        const response = await axios.post(
            `${BACKEND_URL}/feedback/`,
            data,
            { headers: { "Content-Type": "application/json" } }
        );
        return response.data;
    } catch (err: any) {
        console.error("Error posting reply:", err.response?.data || err.message);
        return { error: err.response?.data?.error || "Error setting up the request" };
    }
};

// ===========================Functions=====================================
const API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

export const pinFileToIPFS = async (blob: File) => {
    try {
        const data = new FormData();
        data.append("file", blob);
        
        // Log the keys to verify they're being read
        // console.log('API Key:', API_KEY?.slice(0, 5) + '...');
        
        const res = await fetch(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            {
                method: "POST",
                headers: {
                    pinata_api_key: API_KEY!,
                    pinata_secret_api_key: API_SECRET!,
                },
                body: data,
            }
        );
        
        const resData = await res.json();
        
        if (!res.ok) {
            console.error('Pinata error:', resData);
            throw new Error(resData.error?.details || 'Failed to upload to IPFS');
        }
        
        return resData;
    } catch (error) {
        console.error('Error in pinFileToIPFS:', error);
        return null;
    }
};

export const uploadImage = async (url: string) => {
    try {
        const res = await fetch(url);
        // console.log(res.blob);
        const blob = await res.blob();

        const imageFile = new File([blob], "image.png", { type: "image/png" });
        // console.log(imageFile);
        const resData = await pinFileToIPFS(imageFile);
        // console.log(resData, "RESDATA>>>>");
        
        if (resData && resData.IpfsHash) {
            return `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;
        } else {
            console.error('No IPFS hash received');
            return false;
        }
    } catch (error) {
        console.error('Error in uploadImage:', error);
        return false;
    }
};


export const calculateOutPut = (coin: coinInfo, input: number, isBuy: boolean) => {
    const amount = input * 10 ** (isBuy ? 9 : 6);
    let amount_out = 0;
    let tokens_at_current_price = 0;
    const initialPrice = INITIAL_PRICE;

    if (isBuy) {
        let fee_amount = (amount * FEE_PERCENTAGE)
        let amount_after_fee = amount - fee_amount
        const total_tokens_sold = totalSupply - coin.reserveOne + 1;

        // Calculate min price (current price before buy)
        const minPrice = initialPrice * Math.pow(GROWTH_FACTOR, total_tokens_sold / PRICE_INCREMENT_STEP);

        // Estimate maximum possible tokens that can be bought
        const maxTokensOut = amount_after_fee / minPrice;

        // Calculate max price after buying all possible tokens
        const maxPrice = initialPrice * Math.pow(GROWTH_FACTOR, (total_tokens_sold + maxTokensOut) / PRICE_INCREMENT_STEP);

        // More accurate avg price using logarithmic integral method
        const avgPrice = (maxPrice - minPrice) / Math.log(maxPrice / minPrice);

        // Calculate total tokens bought
        amount_out = amount_after_fee ? (amount_after_fee / avgPrice) / 1e6 : 0;
        tokens_at_current_price = maxTokensOut ? maxTokensOut / 1e6 : 0

    } else {
        const total_tokens_sold = totalSupply - coin.reserveOne + 1;

        // Calculate min price (current price before sell)
        const minPrice = initialPrice * Math.pow(GROWTH_FACTOR, total_tokens_sold / PRICE_INCREMENT_STEP);

        // Calculate max price before selling the tokens
        const maxPrice = initialPrice * Math.pow(GROWTH_FACTOR, (total_tokens_sold + amount) / PRICE_INCREMENT_STEP);

        // More accurate avg price using logarithmic integral method
        const avgPrice = (maxPrice - minPrice) / Math.log(maxPrice / minPrice);

        // Compute SOL received using adjusted price (sell reduction factor applied)
        let sol_out = amount * avgPrice * SELL_REDUCTION;
        tokens_at_current_price = amount ? (amount * minPrice * SELL_REDUCTION) / 1e9 : 0

        // Apply SOL fee (0.1%)
        const fee_amount = sol_out * FEE_PERCENTAGE;
        amount_out = sol_out ? (sol_out - fee_amount) / 1e9 : 0;
    }

    return { amount_out, tokens_at_current_price };
};


 
function calculateTokensBought(reserveOne: number, reserveTwo: number, input: number, isBuy: boolean)
{ 
    const amount = input * 10 ** (isBuy ? 9 : 6);
    let amount_out = 0;
    let tokens_at_current_price = 0;
    let final_price = 0;
    const initialPrice = INITIAL_PRICE;

    const total_tokens_sold = totalSupply - reserveOne + 1;

    // calculate dex price
    const dexPrice = reserveTwo / (totalSupply - total_tokens_sold)
    // Calculate min price (current price before buy)
    const currentPrice = initialPrice * Math.pow(GROWTH_FACTOR, total_tokens_sold / PRICE_INCREMENT_STEP);

    if (isBuy) {
        let fee_amount = (amount * FEE_PERCENTAGE)
        let amount_after_fee = amount - fee_amount
        
        // dex stlye
        if(dexPrice > currentPrice) {
            // Estimate maximum possible tokens that can be bought
            tokens_at_current_price = (amount_after_fee / dexPrice) / 1e6;
            const numerator = amount_after_fee * reserveOne;
            const denominator = (reserveTwo + amount_after_fee);
            // Output amount the user will receive
            amount_out = (numerator / denominator) / 1e6;
            final_price = (reserveTwo + amount_after_fee)/ (totalSupply - (total_tokens_sold + (amount_out * 1e6)))
        // our style
        } else {
            // OUR INITIAL PRICE CURVE
            // Estimate maximum possible tokens that can be bought
            const maxTokensOut = amount_after_fee / currentPrice;
            // Calculate max price after buying all possible tokens
            const maxPrice = initialPrice * Math.pow(GROWTH_FACTOR, (total_tokens_sold + maxTokensOut) / PRICE_INCREMENT_STEP);
            // More accurate avg price using logarithmic integral method
            const avgPrice = (maxPrice - currentPrice) / Math.log(maxPrice / currentPrice);
            // Calculate total tokens bought
            amount_out = (amount_after_fee / avgPrice) / 1e6
            tokens_at_current_price = maxTokensOut / 1e6
            // added for testing
            final_price = initialPrice * Math.pow(GROWTH_FACTOR, (total_tokens_sold + (amount_out * 1e6)) / PRICE_INCREMENT_STEP)
        }
        
        // Otherwise do a sell
    } else {
        // dex stlye
        if(dexPrice > currentPrice) {
            console.log("dexStyle")
            // Estimate maximum possible tokens that can be bought
            tokens_at_current_price = (amount * dexPrice * SELL_REDUCTION) / 1e9;
            const numerator = amount * reserveTwo;
            const denominator = (reserveOne + amount);
            // Output amount the user will receive
            amount_out = (numerator / denominator) / 1e9;
            final_price = (reserveTwo - amount_out)/ (totalSupply + (total_tokens_sold - (amount * 1e6)))
            
        // our style
        } else {
            console.log("ourstyle")
            // Calculate max price before selling the tokens
            const minPrice = initialPrice * Math.pow(GROWTH_FACTOR, (total_tokens_sold - amount) / PRICE_INCREMENT_STEP);
            // More accurate avg price using logarithmic integral method
            const avgPrice = (currentPrice - minPrice) / Math.log(currentPrice / minPrice);
            // Compute SOL received using adjusted price (sell reduction factor applied)
            let sol_out = amount * avgPrice * SELL_REDUCTION;
            tokens_at_current_price = (amount * currentPrice * SELL_REDUCTION) / 1e9
            // Apply SOL fee (0.1%)
            // const fee_amount = sol_out * FEE_PERCENTAGE;
            // amount_out = (sol_out - fee_amount) / 1e9
            amount_out = sol_out / 1e9
            final_price = initialPrice * Math.pow(GROWTH_FACTOR, (total_tokens_sold - amount) / PRICE_INCREMENT_STEP)
            console.log(currentPrice, minPrice, avgPrice, final_price)
        }
    }
    return { amount_out, final_price };
}


export function simulateBuys() {
    
    const amountBuy = 0.1; // 1 SOL in lamports
    let reserveOne = totalSupply
    const howManyBuys = 100
    const solPrice = 196

    
   
    let totalTokensSold = 0.0;
    let totalSOL = 30_000_000.0;


     // buys
    for (let buy = 1; buy <= howManyBuys; buy++) {
        // Calculate tokens bought and final price for this buy
        
        const { amount_out, final_price } = calculateTokensBought(reserveOne, totalSOL,  amountBuy, true);

        totalSOL += (amountBuy * 1e9) - ((amountBuy * 1e9) * 0.001)
        totalTokensSold += amount_out * 1e6
        reserveOne -= amount_out * 1e6
        const nextPrice = final_price


        // Print results for this buy Exponential method
        console.log(`Buy ${buy}:`);
        console.log(`  Tokens Bought: ${(amount_out).toFixed(2)}`);
        console.log(`  Total Tokens Sold: ${(totalTokensSold).toFixed(2)}`);
        console.log(`  Price of Next Token: ${nextPrice.toFixed(9)} SOL`);
        console.log(`  Dex Price: ${totalSOL / (totalSupply - totalTokensSold)}`)
        console.log((totalSOL / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        console.log("-".repeat(40));
    }
     // buys
     const tokensToSell = (totalTokensSold / howManyBuys) / 1e6
     for (let buy = 1; buy <= howManyBuys; buy++) {
        // Calculate tokens bought and final price for this buy
        
        const { amount_out, final_price } = calculateTokensBought(reserveOne, totalSOL,  tokensToSell, false);

        totalTokensSold -= tokensToSell * 1e6
        reserveOne += tokensToSell * 1e6
        totalSOL -= amount_out * 1e9
        const nextPrice = final_price


        // Print results for this buy Exponential method
        console.log(`Sell ${buy}:`);
        console.log(`  SOL Received: ${(amount_out).toFixed(2)}`);
        console.log(`  Tokens Sold: ${(tokensToSell).toFixed(2)}`);
        console.log(`  Total Tokens Sold: ${(totalTokensSold).toFixed(2)}`);
        console.log(`  Price of Next Token: ${nextPrice.toFixed(9)} SOL`);
        console.log(`  Dex Price: ${totalSOL / (totalSupply - totalTokensSold)}`)
        console.log((totalSOL / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        console.log("-".repeat(40));
    }

    // Calculate final price based on total supply and reserve1
    const reserve1 = totalSupply - totalTokensSold;
    const finalPrice = INITIAL_PRICE * Math.pow(GROWTH_FACTOR, totalTokensSold / PRICE_INCREMENT_STEP);
    const launchPrice = totalSOL / reserve1
    const priceMultiplier = finalPrice / INITIAL_PRICE;

    // Print final price with commas
console.log("Final Price Calculation:");
console.log(`  Reserve1 (Total Supply - Total Tokens Sold): ${(reserve1 / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
console.log(`  Tokens Sold: ${(totalTokensSold / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
console.log(`  Final Price: ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 12, maximumFractionDigits: 12 })} SOL`);
console.log(`  Launch Price: ${launchPrice.toLocaleString(undefined, { minimumFractionDigits: 12, maximumFractionDigits: 12 })}`)
console.log(`  Price Change Multiplier: ${priceMultiplier.toFixed(2)}x`);
console.log(`  MarketCapAtLaunch $${((launchPrice / 1e9)*solPrice)*totalSupply}`)
console.log((totalSOL / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))


}

