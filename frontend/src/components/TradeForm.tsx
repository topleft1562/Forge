import { useProgram } from "@/contexts/ProgramProvider";
import { coinInfo, userInfo } from "@/utils/types";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import {
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { calculateOutPut } from "@/utils/util";
import { errorAlert, successAlert } from "./ToastGroup";
import { ADMINKEY } from "@/confgi";
import SlippageModal from "./SlippageModal";

interface TradingFormProps {
    coin: coinInfo;
    tokenBal: number;
    solBal: number;
    user: userInfo;
}

export const TradeForm: React.FC<TradingFormProps> = ({ coin, tokenBal, solBal, user }) => {
    const { program } = useProgram();
    const { connection } = useConnection();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [sol, setSol] = useState<string>("0.25");
    const [isBuy, setIsBuy] = useState<number>(0);
    const [slippage, setSlippage] = useState<string>("5");
    const [showSlippageModal, setShowSlippageModal] = useState(false);

    // Load slippage from localStorage on mount
    useEffect(() => {
        const savedSlippage = localStorage.getItem("userSlippage");
        if (savedSlippage) {
            setSlippage(savedSlippage);
        }
    }, []);

    const swapModes = () => {
        if(isBuy === 0){
            // goto sell
            setIsBuy(1)
            setSol((tokenBal / 10).toFixed(6))
        } else {
            // goto buy
            setIsBuy(0)
            setSol("0.25")
        }
        
    }
   
    
// amount_out = ACTUAL AMOUNT THEY WILL RECEIVE
// tokens_at_current_price = AMOUNT OF TOKENS CALCULATED AT CURRENT PRICE
// tokenBal = Current TOKEN BALANCE
// solBal = Current Sol Balance

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
                ADMINKEY
            );
            const creatorInfo: userInfo = coin.creator as userInfo
            const CREATOR_PUBKEY = new PublicKey(
                creatorInfo.wallet
            )

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
                    creatorAccount: CREATOR_PUBKEY,
                    user: userWallet,
                })
                .preInstructions(instructions) // Add any preliminary instructions
                .rpc({
                    skipPreflight: true,
                });

            console.log({ txHash });
            successAlert(`Trade Success!!!`);
        } catch (error) {
            console.error("Trade failed:", error);
            errorAlert(`Trade Failed....`);
            return
        } finally {
            setIsLoading(false);   
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
        <div className="space-y-4">
           
  
        <button
  onClick={() => setShowSlippageModal(true)}
  className="relative flex items-center gap-1 px-2 py-1 group transition-all rounded-lg border-2 border-transparent hover:border-[#01a8dd] text-sm text-[#01a8dd]/80 hover:text-[#01a8dd] ml-auto"
>
  Max Slippage: {slippage}%
</button>



<div className="relative flex flex-col items-center gap-4">
  {/* First Input Section */}
  <div className="bg-[#1e1e1e] rounded-lg p-4 w-full">
    <label className="block text-[#888] text-sm mb-2">
      Balance: {isBuy === 0 ? tokenBal : solBal} {isBuy === 0 ? "SOL" : coin?.ticker}
    </label>
    <div className="relative">
      <input
        type="text"
        value={sol}
        onChange={handleInputChange}
        className="w-full bg-[#141414] border border-[#01a8dd]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#01a8dd]/40 transition-colors"
        placeholder={`Enter amount in ${isBuy === 0 ? "SOL" : coin?.ticker || "tokens"}`}
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
        {isBuy === 0 ? "SOL" : coin?.ticker}
      </span>
    </div>
  </div>

  {/* Overlapping Button */}
  <button
    className={`absolute left-4 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full transition-all duration-300 shadow-lg ${
      isBuy === 1
        ? 'text-[#01a8dd] hover:bg-[#01a8dd]/10'
        : "bg-gradient-to-r from-[#01a8dd] to-[#4088ae] text-white"
    }`}
    onClick={() => swapModes()}
  >
    {isLoading ? "Loading..." : "Buy"}
  </button>

  {/* Overlapping Button */}
  <button
    className={`absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full transition-all duration-300 shadow-lg ${
      isBuy === 1
        ? "bg-gradient-to-r from-[#dd0101] to-[#ae4040] text-white"
        : 'text-[#01a8dd] hover:bg-[#01a8dd]/10'
    }`}
    onClick={() => swapModes()}
  >
    {isLoading ? "Loading..." : "Sell"}
  </button>

  {/* Second output Section */}
  <div className="bg-[#1e1e1e] rounded-lg p-4 w-full">
  <label className="block text-[#888] text-sm mb-2">Receive</label>
  <div className="relative">
    <div
      className="w-full bg-[#141414] border border-[#01a8dd]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#01a8dd]/40 transition-colors"
    >
      {tokens_at_current_price}
    </div>
    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
      {isBuy === 1 ? "SOL" : coin?.ticker}
    </span>
  </div>
</div>

</div>

                    {isBuy === 0 ? (
                        <div className="flex gap-2 flex-wrap justify-center">
                            
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
                            <button
                                className="px-3 py-2 rounded-lg bg-[#141414] text-[#01a8dd] hover:bg-[#01a8dd]/10 transition-colors text-sm"
                                onClick={() => setSol((solBal * 1e9).toFixed(6))}
                            >
                                Max
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 flex-wrap justify-center">
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

                <SlippageModal
                    isOpen={showSlippageModal}
                    onClose={() => setShowSlippageModal(false)}
                    slippage={slippage}
                    setSlippage={setSlippage}
                />

            </div>
        </div>
    );
};
