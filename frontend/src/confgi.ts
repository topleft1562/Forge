export const marketCapGoal = 50_000 
export const cluster = process.env.NEXT_PUBLIC_CHAIN ?? 'mainnet'
export const totalSupply = 1_000_000_000_000_000 
export const PRICE_INCREMENT_STEP = 1_000_000;
export const GROWTH_FACTOR = 1.0000000035;
export const FEE_PERCENTAGE = 0.01;
export const SELL_REDUCTION = 0.99
export const INITIAL_PRICE = 0.000028;
export const CREATEFEE = 100_000_000;
export const ADMINKEY = process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ?
 "4XcKzy92jkoasQ17TbRCD9xMGhsjZFBJPowWJyfXKuVd" : "8Z7UgKvwfwtax7WjMgCGq61mNpLuJqgwY51yUgS1iAdF"
export const ourFeeToKeep = 5_000_000_000
export const NEXT_PUBLIC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ?
    "https://mainnet.helius-rpc.com/?api-key=c00e3af0-ea96-491d-83a4-f00ec0a330e6"
    :'https://devnet.helius-rpc.com/?api-key=ae50d21e-ae63-43d3-a23f-02cd8c93098c'