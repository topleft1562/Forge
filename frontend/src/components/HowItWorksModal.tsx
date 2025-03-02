import { marketCapGoal, ourFeeToKeep } from '@/confgi';
import { formatTokenGoal } from '@/utils/marketCap';
import React from 'react';

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            <ScrollbarStyles />
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="relative my-4 w-full max-w-2xl">
                    {/* Background blur effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#01a8dd]/10 to-[#4088ae]/10 rounded-xl blur-xl"></div>
                    
                    {/* Modal content */}
                    <div className="relative bg-[#141414] rounded-xl p-6 sm:p-8 w-full border border-[#01a8dd]/20 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {/* Close button positioned absolutely in top-right */}
                        <button 
                            onClick={onClose}
                            className="absolute top-2 right-3 text-[#888] hover:text-[#01a8dd] transition-colors text-2xl z-10"
                        >
                            ×
                        </button>
                        
                        {/* Header with gradient */}
                        <div className="flex justify-center items-center mb-6 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="h-[2px] w-8 bg-gradient-to-r from-transparent via-[#01a8dd] to-transparent"></div>
                                <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#01a8dd] to-[#4088ae]">
                                    How It Works
                                </h2>
                                <div className="h-[2px] w-8 bg-gradient-to-r from-transparent via-[#01a8dd] to-transparent"></div>
                            </div>
                        </div>
                        
                        {/* Content with styled sections */}
                        <div className="space-y-6 text-[#888]">
                            {/* Introduction section */}
                            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10">
                                <h3 className="text-[#01a8dd] font-medium mb-2 text-center">Sol Forge – Secure & Transparent Token Launching</h3>
                                <p className="leading-relaxed text-white">
                                    All tokens created on Sol Forge are safe to trade through a secure and battle-tested token launching system. Every token launched on Sol Forge follows a fair launch model, meaning:
                                </p>
                                <div className="mt-3 grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-2 text-[#01a8dd]/90">
                                        <span className="text-green-400">✅</span> No presale
                                    </div>
                                    <div className="flex items-center gap-2 text-[#01a8dd]/90">
                                        <span className="text-green-400">✅</span> No team allocation
                                    </div>
                                    <div className="flex items-center gap-2 text-[#01a8dd]/90">
                                        <span className="text-green-400">✅</span> Fully transparent bonding curve
                                    </div>
                                </div>
                            </div>

                            {/* How It Works section */}
                            <div className="space-y-3">
                                <h3 className="text-[#01a8dd] font-medium px-4">What to do:</h3>
                                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10 flex items-start gap-3">
                                    <span className="text-[#01a8dd] font-bold">1️⃣</span>
                                    <div>
                                        <span className="text-white">Choose a Token</span> – Pick a token that interests you.
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10 flex items-start gap-3">
                                    <span className="text-[#01a8dd] font-bold">2️⃣</span>
                                    <div>
                                        <span className="text-white">Buy on the Bonding Curve</span> – Purchase tokens directly through our automated bonding system.
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10 flex items-start gap-3">
                                    <span className="text-[#01a8dd] font-bold">3️⃣</span>
                                    <div>
                                        <span className="text-white">Sell Anytime</span> – Secure profits or cut losses whenever you choose.
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10 flex items-start gap-3">
                                    <span className="text-[#01a8dd] font-bold">4️⃣</span>
                                    <div>
                                        <span className="text-white">Liquidity Unlock</span> – When the market cap reaches $50,000, the system deposits $8,500 in liquidity into Raydium and burns it for stability.
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10 flex items-start gap-3">
                                    <span className="text-[#01a8dd] font-bold">5️⃣</span>
                                    <div>
                                        <span className="text-white">Earn as a Creator</span> – Token creators earn a percentage of trading fees to support ongoing development.
                                    </div>
                                </div>
                            </div>

                            {/* Fee Structure section */}
                            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10">
                                <h3 className="text-[#01a8dd] font-medium mb-3">Fee Structure:</h3>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <span className="text-[#01a8dd]">🔹</span>
                                        <div><span className="text-white">1% Trading Fee</span></div>
                                    </div>
                                    <div className="flex items-start gap-2 ml-6">
                                        <span className="text-[#01a8dd]">•</span>
                                        <div><span className="text-white">20%</span> to the Token Creator – Ensuring long-term sustainability.</div>
                                    </div>
                                    <div className="flex items-start gap-2 ml-6">
                                        <span className="text-[#01a8dd]">•</span>
                                        <div><span className="text-white">80%</span> to Forge Marketing – Expanding ecosystem growth.</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-[#01a8dd]">🔹</span>
                                        <div><span className="text-white">5% SOL Migration Fee</span> – Applied when migrating from Sol Forge to Raydium.</div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer disclaimer */}
                            <div className="mt-6 pt-4 border-t border-[#01a8dd]/10">
                                <p className="text-sm text-[#888]/80 italic text-center">
                                    By using this platform, you confirm that you are 18 years of age or older.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Add this to your global CSS file (e.g., globals.css)
// Or create a new style tag in your component
export const ScrollbarStyles = () => (
    <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1a1a1a;
            border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #333333;
            border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #444444;
        }
        
        /* For Firefox */
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #333333 #1a1a1a;
        }
    `}</style>
); 