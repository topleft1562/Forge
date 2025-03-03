
export interface PoolReserves {
    reserveOne: number;  // Token amount (6 decimals)
    reserveTwo: number;  // SOL amount (9 decimals)
}

export type ChartTable = {
    table: {
        open: number;
        high: number;
        low: number;
        close: number;
        time: number;
    }[];
};

export type Chart = {
    time: number;
    opens: number[];
    highs: number[];
    lows: number[];
    closes: number[];
  };

export interface holding {
    _id?: string,
    coinId: coinInfo,
    amount: number
};

export interface userInfo {
    _id?: string,
    name: string,
    wallet: string,
    holdings?: holding[],
    avatar?: string,
    isLedger?: Boolean,
    signature?: string,
}

export interface coinInfo {
    _id?: string,
    name: string,
    creator: string | userInfo,
    ticker: string,
    url: string,
    // Original reserve fields
    reserveOne: number,
    reserveTwo: number,
    // Additional fields for compatibility
    tokenReserve?: number,  // Same as reserveOne
    solanaReserve?: number, // Same as reserveTwo
    token: string,
    isMigrated: boolean,
    lastPrice: string,
    marketcap?: number,
    replies?: number,
    description?: string,
    twitter?: string,
    telegram?: string,
    website?: string,
    date?: Date,
    autoMigrate?: boolean,
}
export interface msgInfo {
    coinId: string | coinInfo,
    sender: string | userInfo,
    time: Date,
    img?: string,
    msg: string,
}

export interface tradeInfo {
    creator: string | coinInfo,
    record: recordInfo[],

}

export interface recordInfo {
    holder: userInfo,
    holdingStatus: number,
    time: Date | string;
    amount: string;
    amountOut: string;
    price: string;
    tx: string,
}
export interface CharTable {
    table: {
        time: number;
        low: number;
        high: number;
        open: number;
        close: number;
        volume: number;
    }[];
}
export interface Bar {
    time: number;
    low: number;
    high: number;
    open: number;
    close: number;
    volume: number;
}
export interface replyInfo {
    coinId: string;
    sender: string;
    msg: string;
    img?: string;
}