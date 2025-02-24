import axios, { AxiosRequestConfig } from 'axios'
import { ChartTable, coinInfo, msgInfo, replyInfo, userInfo } from './types';
import { FEE_PERCENTAGE, PRICE_INCREMENT, PRICE_INCREMENT_STEP, SELL_REDUCTION, totalSupply } from '@/confgi';
import { useState } from 'react';
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
    const amount = input * 10 ** (isBuy ? 9 : 6)
let amount_out = 0
let tokens_at_current_price = 0
const current_price = parseFloat(coin.lastPrice) * 1000
    if(isBuy) {
    const fee_amount = amount * FEE_PERCENTAGE;
    const amount_after_fee = amount - fee_amount
    
    // Calculate how many tokens can be bought at current price tier
    const atPrice = (amount_after_fee / current_price)

    // Adjust price incrementally based on tokens acquired
    const price_adjustment = (atPrice / 2 / PRICE_INCREMENT_STEP) * PRICE_INCREMENT;
    const final_price = current_price + price_adjustment;
    tokens_at_current_price = atPrice / 1e6
    // Compute tokens acquired using adjusted price
    amount_out = (amount_after_fee / final_price) / 1e6
    } else {
// Calculate how many tokens can be sold at current price tier
tokens_at_current_price = (amount * current_price) / 1e9;

// Adjust price decrementally based on tokens sold
const price_adjustment = (amount / 2 / PRICE_INCREMENT_STEP) * PRICE_INCREMENT;
const final_price = (current_price - price_adjustment) * SELL_REDUCTION;

// Compute SOL received using adjusted price
const sol_out = amount  * final_price

// Apply SOL fee (0.1%)
const fee_amount = (sol_out * FEE_PERCENTAGE)
amount_out = (sol_out - fee_amount) / 1e9
    }

    return {amount_out, tokens_at_current_price}
}

    
function calculateTokensBought(initialPrice, growthFactor, tokensPerIncrement, reserveOne, amountIn)
: { tokensBought: number, nextPrice: number } {
    const total_tokens_sold = totalSupply - reserveOne +1
    
    console.log("sold", total_tokens_sold)
    const currentPrice = initialPrice * Math.pow(growthFactor, total_tokens_sold / tokensPerIncrement)
    console.log("current", currentPrice)
    // Calculate the number of increments (n) using the formula
    const numerator = 1.0 - (amountIn * (1.0 - growthFactor)) / (tokensPerIncrement * currentPrice);
    console.log("num", numerator)
    const n = Math.log(numerator) / Math.log(growthFactor);
    console.log("n", n)

    // Calculate total tokens bought
    const tokensBought = n * tokensPerIncrement;
    console.log("bought", tokensBought)

    // Calculate final price
    const nextPrice = currentPrice * Math.pow(growthFactor, n);
    console.log("next", nextPrice)

    return { tokensBought, nextPrice };
}

export function simulateBuys() {
    const initialPrice = 0.00000032425; // Adjusted initial price
    const growthFactor = 1.000000033186334; // 0.01% increase per 10,000 tokens
    const amountIn = 1_000_000_000; // 1 SOL in lamports
    const tokensPerIncrement = 1_000_000; // Growth factor applies every 10,000 tokens
    let reserveOne = totalSupply
    const howManyBuys = 100
   
    let totalTokensSold = 0.0;
    let totalSOL = 0.0;

    // Simulate 100 buys
    for (let buy = 1; buy <= howManyBuys; buy++) {
        // Calculate tokens bought and final price for this buy
        totalSOL += amountIn - (amountIn * 0.001)
        const { tokensBought, nextPrice } = calculateTokensBought(
            initialPrice, growthFactor, tokensPerIncrement, reserveOne, amountIn
        );

        // Update total tokens sold and current price
        totalTokensSold += tokensBought;
        reserveOne -= tokensBought;

        // Print results for this buy
        console.log(`Buy ${buy}:`);
        console.log(`  Tokens Bought: ${(tokensBought / 1e6).toFixed(2)}`);
        console.log(`  Total Tokens Sold: ${(totalTokensSold / 1e6).toFixed(2)}`);
        console.log(`  Price of Next Token: ${nextPrice.toFixed(12)} SOL`);
        console.log("-".repeat(40));
    }

    // Calculate final price based on total supply and reserve1
    const reserve1 = totalSupply - totalTokensSold;
    const incrementsSold = totalTokensSold / tokensPerIncrement;
    const finalPrice = initialPrice * Math.pow(growthFactor, incrementsSold);
    const priceMultiplier = finalPrice / initialPrice;

    // Print final price with commas
console.log("Final Price Calculation:");
console.log(`  Reserve1 (Total Supply - Total Tokens Sold): ${(reserve1 / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
console.log(`  Tokens Sold: ${(totalTokensSold / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
console.log(`  Final Price: ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 12, maximumFractionDigits: 12 })} SOL`);
console.log(`  Launch Price: ${(95_000_000_000 / reserve1).toLocaleString(undefined, { minimumFractionDigits: 12, maximumFractionDigits: 12 })}`)
console.log(`  Price Change Multiplier: ${priceMultiplier.toFixed(2)}x`);
console.log((totalSOL / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
}

