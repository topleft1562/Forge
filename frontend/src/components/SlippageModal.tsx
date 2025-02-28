import React, { useState } from "react";

const SlippageModal = ({ isOpen, onClose, slippage, setSlippage }) => {
  if (!isOpen) return null; // Don't render if modal is closed

  const slippageOptions = [1, 2, 5, 10, 20];
  const [tempSlippage, setTempSlippage] = useState(slippage); // Temporary state for slippage

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#1e1e1e] rounded-lg p-6 w-[350px] shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-400 text-xl"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-white text-lg font-semibold mb-4 flex items-center">
          Swap Slippage Tolerance
        </h2>

        {/* Slippage Options */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {slippageOptions.map((option) => (
            <button
              key={option}
              onClick={() => setTempSlippage(option.toString())} // Only updates temp state
              className={`px-3 py-2 rounded-md text-white transition-all ${
                tempSlippage === option.toString()
                  ? "bg-[#01a8dd] text-black"
                  : "bg-[#141414] hover:bg-[#01a8dd]/10"
              }`}
            >
              {option}%
            </button>
          ))}
        </div>

        {/* Custom Slippage Input */}
        <div className="flex items-center gap-2">
          <span className="text-white">Custom</span>
          <input
            type="text"
            value={tempSlippage}
            onChange={(e) => setTempSlippage(e.target.value)}
            className="w-16 bg-[#141414] border border-[#01a8dd]/20 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[#01a8dd]/40 transition-colors text-center"
            placeholder="0.5"
          />
          <span className="text-white">%</span>
        </div>

        {/* Save Button */}
        <button
          onClick={() => {
            setSlippage(tempSlippage);
            localStorage.setItem("userSlippage", tempSlippage);
            onClose(); // Close modal only on Save
          }}
          className="w-full mt-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity bg-gradient-to-r from-[#01a8dd] to-[#4088ae]"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SlippageModal;
