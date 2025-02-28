/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pump.json`.
 */



export type Pump = {
  address: "AcN1n9AWZPVVuzYzFeJXjSVK5XVUPqZHEjHpeHq9tq1m";
  metadata: {
      name: "pump";
      version: "0.1.0";
      spec: "0.1.0";
      description: "Created with Anchor";
  };
  instructions: [
      {
          name: "addLiquidity";
          discriminator: [181, 157, 89, 67, 143, 182, 52, 72];
          accounts: [
              {
                  name: "pool";
                  writable: true;
              },
              {
                  name: "globalAccount";
                  docs: ["CHECK"];
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "const";
                              value: [103, 108, 111, 98, 97, 108];
                          }
                      ];
                  };
              },
              {
                  name: "liquidityProviderAccount";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "const";
                              value: [
                                  76,
                                  105,
                                  113,
                                  117,
                                  100,
                                  105,
                                  116,
                                  121,
                                  80,
                                  114,
                                  111,
                                  118,
                                  105,
                                  100,
                                  101,
                                  114
                              ];
                          },
                          {
                              kind: "account";
                              path: "pool";
                          },
                          {
                              kind: "account";
                              path: "user";
                          }
                      ];
                  };
              },
              {
                  name: "mintTokenOne";
              },
              {
                  name: "poolTokenAccountOne";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "account";
                              path: "globalAccount";
                          },
                          {
                              kind: "const";
                              value: [
                                  6,
                                  221,
                                  246,
                                  225,
                                  215,
                                  101,
                                  161,
                                  147,
                                  217,
                                  203,
                                  225,
                                  70,
                                  206,
                                  235,
                                  121,
                                  172,
                                  28,
                                  180,
                                  133,
                                  237,
                                  95,
                                  91,
                                  55,
                                  145,
                                  58,
                                  140,
                                  245,
                                  133,
                                  126,
                                  255,
                                  0,
                                  169
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                      program: {
                          kind: "const";
                          value: [
                              140,
                              151,
                              37,
                              143,
                              78,
                              36,
                              137,
                              241,
                              187,
                              61,
                              16,
                              41,
                              20,
                              142,
                              13,
                              131,
                              11,
                              90,
                              19,
                              153,
                              218,
                              255,
                              16,
                              132,
                              4,
                              142,
                              123,
                              216,
                              219,
                              233,
                              248,
                              89
                          ];
                      };
                  };
              },
              {
                  name: "userTokenAccountOne";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "account";
                              path: "user";
                          },
                          {
                              kind: "const";
                              value: [
                                  6,
                                  221,
                                  246,
                                  225,
                                  215,
                                  101,
                                  161,
                                  147,
                                  217,
                                  203,
                                  225,
                                  70,
                                  206,
                                  235,
                                  121,
                                  172,
                                  28,
                                  180,
                                  133,
                                  237,
                                  95,
                                  91,
                                  55,
                                  145,
                                  58,
                                  140,
                                  245,
                                  133,
                                  126,
                                  255,
                                  0,
                                  169
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                      program: {
                          kind: "const";
                          value: [
                              140,
                              151,
                              37,
                              143,
                              78,
                              36,
                              137,
                              241,
                              187,
                              61,
                              16,
                              41,
                              20,
                              142,
                              13,
                              131,
                              11,
                              90,
                              19,
                              153,
                              218,
                              255,
                              16,
                              132,
                              4,
                              142,
                              123,
                              216,
                              219,
                              233,
                              248,
                              89
                          ];
                      };
                  };
              },
              {
                  name: "user";
                  writable: true;
                  signer: true;
              },
              {
                  name: "systemProgram";
                  address: "11111111111111111111111111111111";
              },
              {
                  name: "tokenProgram";
                  address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
              },
              {
                  name: "associatedTokenProgram";
                  address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
              }
          ];
          args: [
              {
                  name: "amountOne";
                  type: "u64";
              },
              {
                  name: "amountTwo";
                  type: "u64";
              }
          ];
      },
      {
          name: "initialize";
          discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
          accounts: [
              {
                  name: "globalAccount";
                  docs: ["CHECK"];
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "const";
                              value: [103, 108, 111, 98, 97, 108];
                          }
                      ];
                  };
              },
              {
                  name: "admin";
                  writable: true;
                  signer: true;
              },
              {
                  name: "rent";
                  address: "SysvarRent111111111111111111111111111111111";
              },
              {
                  name: "systemProgram";
                  address: "11111111111111111111111111111111";
              }
          ];
          args: [
              {
                  name: "fee";
                  type: "f64";
              }
          ];
      },
      {
          name: "initializePool";
          discriminator: [95, 180, 10, 172, 84, 174, 232, 40];
          accounts: [
              {
                  name: "pool";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "const";
                              value: [
                                  108,
                                  105,
                                  113,
                                  117,
                                  105,
                                  100,
                                  105,
                                  116,
                                  121,
                                  95,
                                  112,
                                  111,
                                  111,
                                  108
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                  };
              },
              {
                  name: "mintTokenOne";
              },
              {
                  name: "user";
                  writable: true;
                  signer: true;
              },
              {
                  name: "systemProgram";
                  address: "11111111111111111111111111111111";
              }
          ];
          args: [];
      },
      {
          name: "removeLiquidity";
          discriminator: [80, 85, 209, 72, 24, 206, 177, 108];
          accounts: [
              {
                  name: "pool";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "const";
                              value: [
                                  108,
                                  105,
                                  113,
                                  117,
                                  105,
                                  100,
                                  105,
                                  116,
                                  121,
                                  95,
                                  112,
                                  111,
                                  111,
                                  108
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                  };
              },
              {
                  name: "globalAccount";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "const";
                              value: [103, 108, 111, 98, 97, 108];
                          }
                      ];
                  };
              },
              {
                  name: "mintTokenOne";
                  writable: true;
              },
              {
                  name: "poolTokenAccountOne";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "account";
                              path: "globalAccount";
                          },
                          {
                              kind: "const";
                              value: [
                                  6,
                                  221,
                                  246,
                                  225,
                                  215,
                                  101,
                                  161,
                                  147,
                                  217,
                                  203,
                                  225,
                                  70,
                                  206,
                                  235,
                                  121,
                                  172,
                                  28,
                                  180,
                                  133,
                                  237,
                                  95,
                                  91,
                                  55,
                                  145,
                                  58,
                                  140,
                                  245,
                                  133,
                                  126,
                                  255,
                                  0,
                                  169
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                      program: {
                          kind: "const";
                          value: [
                              140,
                              151,
                              37,
                              143,
                              78,
                              36,
                              137,
                              241,
                              187,
                              61,
                              16,
                              41,
                              20,
                              142,
                              13,
                              131,
                              11,
                              90,
                              19,
                              153,
                              218,
                              255,
                              16,
                              132,
                              4,
                              142,
                              123,
                              216,
                              219,
                              233,
                              248,
                              89
                          ];
                      };
                  };
              },
              {
                  name: "userTokenAccountOne";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "account";
                              path: "user";
                          },
                          {
                              kind: "const";
                              value: [
                                  6,
                                  221,
                                  246,
                                  225,
                                  215,
                                  101,
                                  161,
                                  147,
                                  217,
                                  203,
                                  225,
                                  70,
                                  206,
                                  235,
                                  121,
                                  172,
                                  28,
                                  180,
                                  133,
                                  237,
                                  95,
                                  91,
                                  55,
                                  145,
                                  58,
                                  140,
                                  245,
                                  133,
                                  126,
                                  255,
                                  0,
                                  169
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                      program: {
                          kind: "const";
                          value: [
                              140,
                              151,
                              37,
                              143,
                              78,
                              36,
                              137,
                              241,
                              187,
                              61,
                              16,
                              41,
                              20,
                              142,
                              13,
                              131,
                              11,
                              90,
                              19,
                              153,
                              218,
                              255,
                              16,
                              132,
                              4,
                              142,
                              123,
                              216,
                              219,
                              233,
                              248,
                              89
                          ];
                      };
                  };
              },
              {
                  name: "user";
                  writable: true;
                  signer: true;
              },
              {
                  name: "systemProgram";
                  address: "11111111111111111111111111111111";
              },
              {
                  name: "tokenProgram";
                  address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
              },
              {
                  name: "associatedTokenProgram";
                  address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
              }
          ];
          args: [
              {
                  name: "nonce";
                  type: "u8";
              },
              {
                  name: "initPcAmount";
                  type: "u64";
              }
          ];
      },
      {
          name: "swap";
          discriminator: [248, 198, 158, 145, 225, 117, 135, 200];
          accounts: [
              {
                  name: "pool";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "const";
                              value: [
                                  108,
                                  105,
                                  113,
                                  117,
                                  105,
                                  100,
                                  105,
                                  116,
                                  121,
                                  95,
                                  112,
                                  111,
                                  111,
                                  108
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                  };
              },
              {
                  name: "feeRecipient";
                  writable: true;
              },
              {
                name: "creatorAccount";
                writable: true;
              },
              {
                  name: "globalAccount";
                  docs: ["CHECK"];
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "const";
                              value: [103, 108, 111, 98, 97, 108];
                          }
                      ];
                  };
              },
              {
                  name: "mintTokenOne";
                  writable: true;
              },
              {
                  name: "poolTokenAccountOne";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "account";
                              path: "globalAccount";
                          },
                          {
                              kind: "const";
                              value: [
                                  6,
                                  221,
                                  246,
                                  225,
                                  215,
                                  101,
                                  161,
                                  147,
                                  217,
                                  203,
                                  225,
                                  70,
                                  206,
                                  235,
                                  121,
                                  172,
                                  28,
                                  180,
                                  133,
                                  237,
                                  95,
                                  91,
                                  55,
                                  145,
                                  58,
                                  140,
                                  245,
                                  133,
                                  126,
                                  255,
                                  0,
                                  169
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                      program: {
                          kind: "const";
                          value: [
                              140,
                              151,
                              37,
                              143,
                              78,
                              36,
                              137,
                              241,
                              187,
                              61,
                              16,
                              41,
                              20,
                              142,
                              13,
                              131,
                              11,
                              90,
                              19,
                              153,
                              218,
                              255,
                              16,
                              132,
                              4,
                              142,
                              123,
                              216,
                              219,
                              233,
                              248,
                              89
                          ];
                      };
                  };
              },
              {
                  name: "userTokenAccountOne";
                  writable: true;
                  pda: {
                      seeds: [
                          {
                              kind: "account";
                              path: "user";
                          },
                          {
                              kind: "const";
                              value: [
                                  6,
                                  221,
                                  246,
                                  225,
                                  215,
                                  101,
                                  161,
                                  147,
                                  217,
                                  203,
                                  225,
                                  70,
                                  206,
                                  235,
                                  121,
                                  172,
                                  28,
                                  180,
                                  133,
                                  237,
                                  95,
                                  91,
                                  55,
                                  145,
                                  58,
                                  140,
                                  245,
                                  133,
                                  126,
                                  255,
                                  0,
                                  169
                              ];
                          },
                          {
                              kind: "account";
                              path: "mintTokenOne";
                          }
                      ];
                      program: {
                          kind: "const";
                          value: [
                              140,
                              151,
                              37,
                              143,
                              78,
                              36,
                              137,
                              241,
                              187,
                              61,
                              16,
                              41,
                              20,
                              142,
                              13,
                              131,
                              11,
                              90,
                              19,
                              153,
                              218,
                              255,
                              16,
                              132,
                              4,
                              142,
                              123,
                              216,
                              219,
                              233,
                              248,
                              89
                          ];
                      };
                  };
              },
              {
                  name: "user";
                  writable: true;
                  signer: true;
              },
              {
                  name: "rent";
                  address: "SysvarRent111111111111111111111111111111111";
              },
              {
                  name: "systemProgram";
                  address: "11111111111111111111111111111111";
              },
              {
                  name: "tokenProgram";
                  address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
              },
              {
                  name: "associatedTokenProgram";
                  address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
              }
          ];
          args: [
              {
                  name: "amount";
                  type: "u64";
              },
              {
                  name: "style";
                  type: "u64";
              },
              {
                name: "minOut",
                type: "u64",
            }
          ];
      }
  ];
  accounts: [
      {
          name: "curveConfiguration";
          discriminator: [225, 242, 252, 198, 63, 77, 56, 255];
      },
      {
          name: "liquidityPool";
          discriminator: [66, 38, 17, 64, 188, 80, 68, 129];
      },
      {
          name: "liquidityProvider";
          discriminator: [219, 241, 238, 133, 56, 225, 229, 191];
      }
  ];
  errors: [
      {
          code: 6000;
          name: "duplicateTokenNotAllowed";
          msg: "Duplicate tokens are not allowed";
      },
      {
          code: 6001;
          name: "failedToAllocateShares";
          msg: "Failed to allocate shares";
      },
      {
          code: 6002;
          name: "failedToDeallocateShares";
          msg: "Failed to deallocate shares";
      },
      {
          code: 6003;
          name: "insufficientShares";
          msg: "Insufficient shares";
      },
      {
          code: 6004;
          name: "insufficientFunds";
          msg: "Insufficient funds to swap";
      },
      {
          code: 6005;
          name: "invalidAmount";
          msg: "Invalid amount to swap";
      },
      {
          code: 6006;
          name: "invalidFee";
          msg: "Invalid fee";
      },
      {
          code: 6007;
          name: "failedToAddLiquidity";
          msg: "Failed to add liquidity";
      },
      {
          code: 6008;
          name: "failedToRemoveLiquidity";
          msg: "Failed to remove liquidity";
      },
      {
          code: 6009;
          name: "overflowOrUnderflowOccurred";
          msg: "Overflow or underflow occured";
      },
      {
          code: 6010;
          name: "feeTransferFailed";
          msg: "Failed to transfer fees";
      }
  ];
  types: [
      {
          name: "curveConfiguration";
          type: {
              kind: "struct";
              fields: [
                  {
                      name: "fees";
                      type: "f64";
                  },
                  {
                      name: "feeRecipient";
                      type: "pubkey";
                  }
              ];
          };
      },
      {
          name: "liquidityPool";
          type: {
              kind: "struct";
              fields: [
                  {
                      name: "tokenOne";
                      type: "pubkey";
                  },
                  {
                      name: "tokenTwo";
                      type: "pubkey";
                  },
                  {
                      name: "totalSupply";
                      type: "u64";
                  },
                  {
                      name: "reserveOne";
                      type: "u64";
                  },
                  {
                      name: "reserveTwo";
                      type: "u64";
                  },
                  {
                      name: "bump";
                      type: "u8";
                  },
                  {
                      name: "padding";
                      type: {
                          array: ["u8", 7];
                      };
                  }
              ];
          };
      },
      {
          name: "liquidityProvider";
          type: {
              kind: "struct";
              fields: [
                  {
                      name: "shares";
                      type: "u64";
                  }
              ];
          };
      }
  ];
};

export const IDL: Pump = {
  address: "AcN1n9AWZPVVuzYzFeJXjSVK5XVUPqZHEjHpeHq9tq1m",
  metadata: {
      name: "pump",
      version: "0.1.0",
      spec: "0.1.0",
      description: "Created with Anchor",
  },
  instructions: [
      {
          name: "addLiquidity",
          discriminator: [181, 157, 89, 67, 143, 182, 52, 72],
          accounts: [
              {
                  name: "pool",
                  writable: true,
              },
              {
                  name: "globalAccount",
                  docs: ["CHECK"],
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "const",
                              value: [103, 108, 111, 98, 97, 108],
                          },
                      ],
                  },
              },
              {
                  name: "liquidityProviderAccount",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "const",
                              value: [
                                  76, 105, 113, 117, 100, 105, 116, 121, 80,
                                  114, 111, 118, 105, 100, 101, 114,
                              ],
                          },
                          {
                              kind: "account",
                              path: "pool",
                          },
                          {
                              kind: "account",
                              path: "user",
                          },
                      ],
                  },
              },
              {
                  name: "mintTokenOne",
              },
              {
                  name: "poolTokenAccountOne",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "account",
                              path: "globalAccount",
                          },
                          {
                              kind: "const",
                              value: [
                                  6, 221, 246, 225, 215, 101, 161, 147, 217,
                                  203, 225, 70, 206, 235, 121, 172, 28, 180,
                                  133, 237, 95, 91, 55, 145, 58, 140, 245,
                                  133, 126, 255, 0, 169,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                      program: {
                          kind: "const",
                          value: [
                              140, 151, 37, 143, 78, 36, 137, 241, 187, 61,
                              16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218,
                              255, 16, 132, 4, 142, 123, 216, 219, 233, 248,
                              89,
                          ],
                      },
                  },
              },
              {
                  name: "userTokenAccountOne",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "account",
                              path: "user",
                          },
                          {
                              kind: "const",
                              value: [
                                  6, 221, 246, 225, 215, 101, 161, 147, 217,
                                  203, 225, 70, 206, 235, 121, 172, 28, 180,
                                  133, 237, 95, 91, 55, 145, 58, 140, 245,
                                  133, 126, 255, 0, 169,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                      program: {
                          kind: "const",
                          value: [
                              140, 151, 37, 143, 78, 36, 137, 241, 187, 61,
                              16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218,
                              255, 16, 132, 4, 142, 123, 216, 219, 233, 248,
                              89,
                          ],
                      },
                  },
              },
              {
                  name: "user",
                  writable: true,
                  signer: true,
              },
              {
                  name: "systemProgram",
                  address: "11111111111111111111111111111111",
              },
              {
                  name: "tokenProgram",
                  address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                  name: "associatedTokenProgram",
                  address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
              },
          ],
          args: [
              {
                  name: "amountOne",
                  type: "u64",
              },
              {
                  name: "amountTwo",
                  type: "u64",
              },
          ],
      },
      {
          name: "initialize",
          discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
          accounts: [
              {
                  name: "globalAccount",
                  docs: ["CHECK"],
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "const",
                              value: [103, 108, 111, 98, 97, 108],
                          },
                      ],
                  },
              },
              {
                  name: "admin",
                  writable: true,
                  signer: true,
              },
              {
                  name: "rent",
                  address: "SysvarRent111111111111111111111111111111111",
              },
              {
                  name: "systemProgram",
                  address: "11111111111111111111111111111111",
              },
          ],
          args: [
              {
                  name: "fee",
                  type: "f64",
              },
          ],
      },
      {
          name: "initializePool",
          discriminator: [95, 180, 10, 172, 84, 174, 232, 40],
          accounts: [
              {
                  name: "pool",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "const",
                              value: [
                                  108, 105, 113, 117, 105, 100, 105, 116, 121,
                                  95, 112, 111, 111, 108,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                  },
              },
              {
                  name: "mintTokenOne",
              },
              {
                  name: "user",
                  writable: true,
                  signer: true,
              },
              {
                  name: "systemProgram",
                  address: "11111111111111111111111111111111",
              },
          ],
          args: [],
      },
      {
          name: "removeLiquidity",
          discriminator: [80, 85, 209, 72, 24, 206, 177, 108],
          accounts: [
              {
                  name: "pool",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "const",
                              value: [
                                  108, 105, 113, 117, 105, 100, 105, 116, 121,
                                  95, 112, 111, 111, 108,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                  },
              },
              {
                  name: "globalAccount",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "const",
                              value: [103, 108, 111, 98, 97, 108],
                          },
                      ],
                  },
              },
              {
                  name: "mintTokenOne",
                  writable: true,
              },
              {
                  name: "poolTokenAccountOne",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "account",
                              path: "globalAccount",
                          },
                          {
                              kind: "const",
                              value: [
                                  6, 221, 246, 225, 215, 101, 161, 147, 217,
                                  203, 225, 70, 206, 235, 121, 172, 28, 180,
                                  133, 237, 95, 91, 55, 145, 58, 140, 245,
                                  133, 126, 255, 0, 169,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                      program: {
                          kind: "const",
                          value: [
                              140, 151, 37, 143, 78, 36, 137, 241, 187, 61,
                              16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218,
                              255, 16, 132, 4, 142, 123, 216, 219, 233, 248,
                              89,
                          ],
                      },
                  },
              },
              {
                  name: "userTokenAccountOne",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "account",
                              path: "user",
                          },
                          {
                              kind: "const",
                              value: [
                                  6, 221, 246, 225, 215, 101, 161, 147, 217,
                                  203, 225, 70, 206, 235, 121, 172, 28, 180,
                                  133, 237, 95, 91, 55, 145, 58, 140, 245,
                                  133, 126, 255, 0, 169,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                      program: {
                          kind: "const",
                          value: [
                              140, 151, 37, 143, 78, 36, 137, 241, 187, 61,
                              16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218,
                              255, 16, 132, 4, 142, 123, 216, 219, 233, 248,
                              89,
                          ],
                      },
                  },
              },
              {
                  name: "user",
                  writable: true,
                  signer: true,
              },
              {
                  name: "systemProgram",
                  address: "11111111111111111111111111111111",
              },
              {
                  name: "tokenProgram",
                  address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                  name: "associatedTokenProgram",
                  address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
              },
          ],
          args: [
              {
                  name: "nonce",
                  type: "u8",
              },
              {
                  name: "initPcAmount",
                  type: "u64",
              },
          ],
      },
      {
          name: "swap",
          discriminator: [248, 198, 158, 145, 225, 117, 135, 200],
          accounts: [
              
              {
                  name: "pool",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "const",
                              value: [
                                  108, 105, 113, 117, 105, 100, 105, 116, 121,
                                  95, 112, 111, 111, 108,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                  },
              },
              {
                  name: "feeRecipient",
                  writable: true,
              },
              {
                name: "creatorAccount",
                writable: true,
              },
              {
                  name: "globalAccount",
                  docs: ["CHECK"],
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "const",
                              value: [103, 108, 111, 98, 97, 108],
                          },
                      ],
                  },
              },
              {
                  name: "mintTokenOne",
                  writable: true,
              },
              {
                  name: "poolTokenAccountOne",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "account",
                              path: "globalAccount",
                          },
                          {
                              kind: "const",
                              value: [
                                  6, 221, 246, 225, 215, 101, 161, 147, 217,
                                  203, 225, 70, 206, 235, 121, 172, 28, 180,
                                  133, 237, 95, 91, 55, 145, 58, 140, 245,
                                  133, 126, 255, 0, 169,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                      program: {
                          kind: "const",
                          value: [
                              140, 151, 37, 143, 78, 36, 137, 241, 187, 61,
                              16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218,
                              255, 16, 132, 4, 142, 123, 216, 219, 233, 248,
                              89,
                          ],
                      },
                  },
              },
              {
                  name: "userTokenAccountOne",
                  writable: true,
                  pda: {
                      seeds: [
                          {
                              kind: "account",
                              path: "user",
                          },
                          {
                              kind: "const",
                              value: [
                                  6, 221, 246, 225, 215, 101, 161, 147, 217,
                                  203, 225, 70, 206, 235, 121, 172, 28, 180,
                                  133, 237, 95, 91, 55, 145, 58, 140, 245,
                                  133, 126, 255, 0, 169,
                              ],
                          },
                          {
                              kind: "account",
                              path: "mintTokenOne",
                          },
                      ],
                      program: {
                          kind: "const",
                          value: [
                              140, 151, 37, 143, 78, 36, 137, 241, 187, 61,
                              16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218,
                              255, 16, 132, 4, 142, 123, 216, 219, 233, 248,
                              89,
                          ],
                      },
                  },
              },
              {
                  name: "user",
                  writable: true,
                  signer: true,
              },
              {
                  name: "rent",
                  address: "SysvarRent111111111111111111111111111111111",
              },
              {
                  name: "systemProgram",
                  address: "11111111111111111111111111111111",
              },
              {
                  name: "tokenProgram",
                  address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              },
              {
                  name: "associatedTokenProgram",
                  address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
              },
          ],
          args: [
              {
                  name: "amount",
                  type: "u64",
              },
              {
                  name: "style",
                  type: "u64",
              },
              {
                  name: "minOut",
                  type: "u64",
              }
          ],
      },
  ],
  accounts: [
      {
          name: "curveConfiguration",
          discriminator: [225, 242, 252, 198, 63, 77, 56, 255],
      },
      {
          name: "liquidityPool",
          discriminator: [66, 38, 17, 64, 188, 80, 68, 129],
      },
      {
          name: "liquidityProvider",
          discriminator: [219, 241, 238, 133, 56, 225, 229, 191],
      },
  ],
  errors: [
      {
          code: 6000,
          name: "duplicateTokenNotAllowed",
          msg: "Duplicate tokens are not allowed",
      },
      {
          code: 6001,
          name: "failedToAllocateShares",
          msg: "Failed to allocate shares",
      },
      {
          code: 6002,
          name: "failedToDeallocateShares",
          msg: "Failed to deallocate shares",
      },
      {
          code: 6003,
          name: "insufficientShares",
          msg: "Insufficient shares",
      },
      {
          code: 6004,
          name: "insufficientFunds",
          msg: "Insufficient funds to swap",
      },
      {
          code: 6005,
          name: "invalidAmount",
          msg: "Invalid amount to swap",
      },
      {
          code: 6006,
          name: "invalidFee",
          msg: "Invalid fee",
      },
      {
          code: 6007,
          name: "failedToAddLiquidity",
          msg: "Failed to add liquidity",
      },
      {
          code: 6008,
          name: "failedToRemoveLiquidity",
          msg: "Failed to remove liquidity",
      },
      {
          code: 6009,
          name: "overflowOrUnderflowOccurred",
          msg: "Overflow or underflow occured",
      },
      {
          code: 6010,
          name: "feeTransferFailed",
          msg: "Failed to transfer fees",
      },
  ],
  types: [
      {
          name: "curveConfiguration",
          type: {
              kind: "struct",
              fields: [
                  {
                      name: "fees",
                      type: "f64",
                  },
                  {
                      name: "feeRecipient",
                      type: "pubkey",
                  },
              ],
          },
      },
      {
          name: "liquidityPool",
          type: {
              kind: "struct",
              fields: [
                  {
                      name: "tokenOne",
                      type: "pubkey",
                  },
                  {
                      name: "tokenTwo",
                      type: "pubkey",
                  },
                  {
                      name: "totalSupply",
                      type: "u64",
                  },
                  {
                      name: "reserveOne",
                      type: "u64",
                  },
                  {
                      name: "reserveTwo",
                      type: "u64",
                  },
                  {
                      name: "bump",
                      type: "u8",
                  },
                  {
                      name: "padding",
                      type: {
                          array: ["u8", 7],
                      },
                  },
              ],
          },
      },
      {
          name: "liquidityProvider",
          type: {
              kind: "struct",
              fields: [
                  {
                      name: "shares",
                      type: "u64",
                  },
              ],
          },
      },
  ],
};