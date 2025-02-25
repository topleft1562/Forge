import { useProgram } from "@/contexts/ProgramProvider";
import { coinInfo, userInfo } from "@/utils/types";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { BN } from "@coral-xyz/anchor";
import {
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { calculateOutPut } from "@/utils/util";

interface TradingFormProps {
    coin: coinInfo;
    tokenBal: number;
    user: userInfo;
}

export const TradeForm: React.FC<TradingFormProps> = ({ coin, tokenBal, user }) => {
    const { program } = useProgram();
    const { connection } = useConnection();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [sol, setSol] = useState<string>("0.25");
    const [isBuy, setIsBuy] = useState<number>(0);
    const [showSlippage, setShowSlippage] = useState<boolean>(false);
    const [slippage, setSlippage] = useState<string>("1");

    const {amount_out, tokens_at_current_price} = calculateOutPut(coin, parseFloat(sol), isBuy === 0 )
    const slippageToHigh = amount_out < tokens_at_current_price * (1 - (Number(slippage) / 100)) 
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isNaN(parseFloat(value))) {
            setSol(value);
        } else if (value === "") {
            setSol(""); // Allow empty string to clear the input
        }
    };
    
    const isDisabled = !user._id || coin.isMigrated || isLoading || slippageToHigh
    const handlTrade = async () => {
        setIsLoading(true);
        
        try {
            
            const mint = new PublicKey(coin.token);
            // await swapTx(mint, wallet, (parseFloat(sol) * 10 ** (isBuy === 0 ? 9 : 6)).toString(),  isBuy )
            
           // set minOut based on out - x%
           const minOut = tokens_at_current_price * (1 - (Number(slippage) / 100));
            const userWallet = new PublicKey(user.wallet);

            // Get the associated token account address
            const tokenAccount = getAssociatedTokenAddressSync(
                mint,
                userWallet
            );
            // Check if the token account exists
            const tokenAccountInfo = await connection.getAccountInfo(
                tokenAccount
            );

            let instructions = [];
            // If token account doesn't exist, add instruction to create it
            if (!tokenAccountInfo) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(
                        userWallet, // payer
                        tokenAccount, // ata
                        userWallet, // owner
                        mint // mint
                    )
                );
            }
            const ADMIN_PUBKEY = new PublicKey(
                "8Z7UgKvwfwtax7WjMgCGq61mNpLuJqgwY51yUgS1iAdF"
            );

            // Add the swap instruction
            const txHash = await program.methods
                .swap(
                    new BN(parseFloat(sol) * 10 ** (isBuy === 0 ? 9 : 6)),
                    new BN(isBuy),
                    new BN(minOut)
                )
                .accounts({
                    mintTokenOne: mint,
                    feeRecipient: ADMIN_PUBKEY,
                    user: userWallet,
                })
                .preInstructions(instructions) // Add any preliminary instructions
                .rpc({
                    skipPreflight: true,
                });

            console.log({ txHash });
            
        } catch (error) {
            console.error("Trade failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isNaN(parseFloat(value)) || value === "") {
            setSlippage(value);
        }
    };

    return (
        <div className="relative">
            <div
                className="relative rounded-xl border border-[#3c3f44] p-[6%]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(144, 205, 240, 0.09) 0%, rgb(27, 27, 31) 100%)",
                }}
            >
                <div className="flex justify-between mb-6">
                    <button
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            isBuy === 0
                                ? "bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white"
                                : "text-[#01a8dd] hover:bg-[#01a8dd]/10"
                        }`}
                        onClick={() => setIsBuy(0)}
                    >
                        {isLoading ? "Loading..." : "Buy"}
                    </button>
{/*
                    <div className="flex flex-col">
  <span className="text-[#999]">
    Receive: {amount_out.toFixed(2)} {isBuy === 1 ? "SOL" : coin?.ticker}
  </span>
  <span className="text-[#999]">
    At Current: {tokens_at_current_price.toFixed(2)} {isBuy === 1 ? "SOL" : coin?.ticker}
  </span>
</div>
*/}

                    <button
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            isBuy === 1
                                ? "bg-gradient-to-r from-[#dd0101] to-[#ae4040] text-white"
                                : "text-[#01a8dd] hover:bg-[#01a8dd]/10"
                        }`}
                        onClick={() => setIsBuy(1)}
                    >
                        {isLoading ? "Loading..." : "Sell"}
                    </button>
                </div>

                <div className="space-y-4">
                    
                <div className="flex justify-end">
            <button
              onClick={() => setShowSlippage(!showSlippage)}
              className="text-sm text-[#01a8dd]/80 hover:text-[#01a8dd] transition-colors flex items-center gap-1"
            >
              Max Slippage: {slippage}%
              <svg 
                className={`w-4 h-4 transition-transform ${showSlippage ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showSlippage && (
            <div className="animate-fade-in">
              <label className="block text-[#888] text-sm mb-2">
                Adjust Max Slippage
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slippage}
                  onChange={handleSlippageChange}
                  className="w-full bg-[#141414] border border-[#01a8dd]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#01a8dd]/40 transition-colors"
                  placeholder="Enter max slippage %"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">%</span>
              </div>
            </div>
          )}
                  

                    <div>
                        <label className="block text-[#888] text-sm mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={sol}
                                onChange={handleInputChange}
                                className="w-full bg-[#141414] border border-[#01a8dd]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#01a8dd]/40 transition-colors"
                                placeholder={`Enter amount in ${
                                    isBuy === 0
                                        ? "SOL"
                                        : coin?.ticker || "tokens"
                                }`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
                                {isBuy === 0 ? "SOL" : coin?.ticker}
                            </span>
                        </div>
                    </div>

                    {isBuy === 0 ? (
                        <div className="flex gap-2 flex-wrap">
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() => setSol("0")}
                            >
                                Clear
                            </button>
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() => setSol("0.25")}
                            >
                                0.25 SOL
                            </button>
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() => setSol("1")}
                            >
                                1 SOL
                            </button>
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() => setSol("2.5")}
                            >
                                2.5 SOL
                            </button>
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() => setSol("5")}
                            >
                                5 SOL
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 flex-wrap">
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() => setSol("0")}
                            >
                                Clear
                            </button>
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() =>
                                    setSol((tokenBal / 10).toFixed(6))
                                }
                            >
                                10%
                            </button>
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() =>
                                    setSol((tokenBal / 4).toFixed(6))
                                }
                            >
                                25%
                            </button>
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() =>
                                    setSol((tokenBal / 2).toFixed(6))
                                }
                            >
                                50%
                            </button>
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() => setSol(tokenBal.toString())}
                            >
                                100%
                            </button>
                        </div>
                    )}

<button
  onClick={handlTrade}
  disabled={isDisabled}
  className={`w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity 
              ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
  style={{
    backgroundImage:
      isBuy === 0 
        ? "linear-gradient(9deg, rgb(0, 104, 143) 0%, rgb(138, 212, 249) 100%)"
        : "linear-gradient(9deg, rgb(143, 0, 0) 0%, rgb(249, 138, 138) 100%)"
  }}
>
  {slippageToHigh ? "Slippage Error" : !user._id ? 'No User!' : coin.isMigrated ? "Migrated" : isBuy === 0 ? "Buy Token" : "Sell Token"}
</button>
                </div>
            </div>
        </div>
    );
};
