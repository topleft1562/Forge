export const ourFeeToKeep = 5_000_000_000
export const marketCapGoal = 50_000
export const cluster = process.env.NEXT_PUBLIC_CHAIN ?? 'mainnet'
export const INITIAL_PRICE = 0.000028;
export const totalSupply = 1_000_000_000_000_000;
export const initialSOL = 30_000_000
export const priorityLamports = 5000
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ?
    "https://mainnet.helius-rpc.com/?api-key=c00e3af0-ea96-491d-83a4-f00ec0a330e6" 
    :"https://devnet.helius-rpc.com/?api-key=ae50d21e-ae63-43d3-a23f-02cd8c93098c"
     

