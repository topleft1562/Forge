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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="relative my-4 w-full max-w-2xl">
                {/* Background blur effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#01a8dd]/10 to-[#4088ae]/10 rounded-xl blur-xl"></div>
                
                {/* Modal content */}
                <div className="relative bg-[#141414] rounded-xl p-6 sm:p-8 w-full border border-[#01a8dd]/20 shadow-xl max-h-[90vh] overflow-y-auto">
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
                        <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10">
                            <p className="leading-relaxed">
                                Sol Forge offers a secure platform to launch and trade tokens. Each token is a fair-launch with no presale and no team allocation, enhancing safety and transparency. Create your token, buy tokens, start trading.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10">
                                <p className="leading-relaxed flex items-start">
                                    <span className="text-[#01a8dd] mr-2">1.</span>
                                    When enough people buy into a token, it helps the bonding curve as it reaches a market cap of {formatTokenGoal(marketCapGoal)}.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#01a8dd]/10">
                                <p className="leading-relaxed flex items-start">
                                    <span className="text-[#01a8dd] mr-2">2.</span>
                                    The collected SOL and Tokens are then migrated into Radium liquidity pool.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-[#01a8dd]/10">
                            <p className="text-sm text-[#888]/80 italic text-center">
                                By using the platform you confirm that you are 18 years of age or older.
                                1% Trade Fees
                                    :0.2% to Creator
                                    :0.8% to Forge marketing
                                5% SOL Migration fee 
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 