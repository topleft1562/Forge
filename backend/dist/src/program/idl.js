"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDL = void 0;
exports.IDL = {
    "version": "0.1.0",
    "name": "pump",
    "address": "5wAPQCQPif8g6PMAJJUYDxmmRbYzXSFBCHH2NsGGU5xH",
    "metadata": {
        "address": "5wAPQCQPif8g6PMAJJUYDxmmRbYzXSFBCHH2NsGGU5xH",
        "name": "pump",
        "version": "0.1.0",
        "spec": "1.0.0"
    },
    "instructions": [
        {
            "name": "initialize",
            "accounts": [
                {
                    "name": "dexConfigurationAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "globalAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK"
                    ]
                },
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "fee",
                    "type": "f64"
                }
            ]
        },
        {
            "name": "initializePool",
            "accounts": [
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mintTokenOne",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "addLiquidity",
            "accounts": [
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "globalAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK"
                    ]
                },
                {
                    "name": "liquidityProviderAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mintTokenOne",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolTokenAccountOne",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccountOne",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amountOne",
                    "type": "u64"
                },
                {
                    "name": "amountTwo",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "removeLiquidity",
            "accounts": [
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "globalAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mintTokenOne",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolTokenAccountOne",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccountOne",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "isCancel",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "swap",
            "accounts": [
                {
                    "name": "dexConfigurationAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "pool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "feeRecipient",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "globalAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "CHECK"
                    ]
                },
                {
                    "name": "mintTokenOne",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "poolTokenAccountOne",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccountOne",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "style",
                    "type": "u64"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "curveConfiguration",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "fees",
                        "type": "f64"
                    },
                    {
                        "name": "feeRecipient",
                        "type": "publicKey"
                    }
                ]
            }
        },
        {
            "name": "liquidityProvider",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "shares",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "liquidityPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "tokenOne",
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenTwo",
                        "type": "publicKey"
                    },
                    {
                        "name": "totalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "reserveOne",
                        "type": "u64"
                    },
                    {
                        "name": "reserveTwo",
                        "type": "u64"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "padding",
                        "type": {
                            "array": [
                                "u8",
                                7
                            ]
                        }
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "DuplicateTokenNotAllowed",
            "msg": "Duplicate tokens are not allowed"
        },
        {
            "code": 6001,
            "name": "FailedToAllocateShares",
            "msg": "Failed to allocate shares"
        },
        {
            "code": 6002,
            "name": "FailedToDeallocateShares",
            "msg": "Failed to deallocate shares"
        },
        {
            "code": 6003,
            "name": "InsufficientShares",
            "msg": "Insufficient shares"
        },
        {
            "code": 6004,
            "name": "InsufficientFunds",
            "msg": "Insufficient funds to swap"
        },
        {
            "code": 6005,
            "name": "InvalidAmount",
            "msg": "Invalid amount to swap"
        },
        {
            "code": 6006,
            "name": "InvalidFee",
            "msg": "Invalid fee"
        },
        {
            "code": 6007,
            "name": "FailedToAddLiquidity",
            "msg": "Failed to add liquidity"
        },
        {
            "code": 6008,
            "name": "FailedToRemoveLiquidity",
            "msg": "Failed to remove liquidity"
        },
        {
            "code": 6009,
            "name": "OverflowOrUnderflowOccurred",
            "msg": "Overflow or underflow occured"
        },
        {
            "code": 6010,
            "name": "FeeTransferFailed",
            "msg": "Failed to transfer fees"
        }
    ]
};
