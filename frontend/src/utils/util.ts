import axios, { AxiosRequestConfig } from 'axios'
import { ChartTable, coinInfo, msgInfo, replyInfo, userInfo } from './types';
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
        console.log("response:", response.data)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const walletConnect = async ({ data }: { data: userInfo }): Promise<any> => {
    try {
        console.log("============walletConnect=========")
        const response = await axios.post(`${BACKEND_URL}/user/`, data)
        console.log("==============response=====================", response.data, config)
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
        console.log("Attempting to fetch coins from:", `${BACKEND_URL}/coin`);
        const res = await axios.get(`${BACKEND_URL}/coin`, config);
        console.log("Coin response:", res.data);
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
        console.log("coinINfo", data)
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
        console.log("trade response::", response)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const postReply = async (data: replyInfo) => {
    console.log("Sending data:", data);
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
        console.log('API Key:', API_KEY?.slice(0, 5) + '...');
        
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
        console.log(res.blob);
        const blob = await res.blob();

        const imageFile = new File([blob], "image.png", { type: "image/png" });
        console.log(imageFile);
        const resData = await pinFileToIPFS(imageFile);
        console.log(resData, "RESDATA>>>>");
        
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