"use client";

import { Spinner } from "@/components/Spinner";
import { infoAlert, errorAlert, successAlert } from "@/components/ToastGroup";
import UserContext from "@/context/UserContext";
import { useSocket } from "@/contexts/SocketContext";
import { coinInfo } from "@/utils/types";
import { createNewCoin, uploadImage } from "@/utils/util";
import Link from "next/link";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { GiThorHammer } from "react-icons/gi";
import { IoMdRocket } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { EmojiClickData } from 'emoji-picker-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { useRouter } from "next/navigation";
import { ADMINKEY, CREATEFEE } from "@/confgi";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getSolBalance } from "@/program/web3";


export default function CreateCoin() {
  const { user, imageUrl, setImageUrl, isCreated, setIsCreated } = useContext(UserContext);
  const { isLoading, setIsLoading, alertState } = useSocket();
  const [newCoin, setNewCoin] = useState<coinInfo>({} as coinInfo);
  const [isCreate, setIsCreate] = useState(false);
  const [visible, setVisible] = useState<Boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  

  useEffect(() => {
    if (
      newCoin.name !== undefined &&
      newCoin.creator !== undefined &&
      typeof newCoin.marketcap === "number" &&
      typeof newCoin.replies === "number" &&
      newCoin.ticker !== undefined
    )
      setIsCreate(true);
  }, [newCoin]);

  useEffect(() => {
    setImageUrl('');
    setSelectedFileName('');

    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCoin({ ...newCoin, [e.target.id]: e.target.value });
  };

  const checkWalletBalance = async (walletAddress: string) => {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error checking balance:', error);
      return 0;
    }
};

const createCoin = async () => {
  setIsLoading(true);
  try {
    if (!imageUrl) {
      errorAlert("Please upload an image");
      return;
    }

    if (!newCoin.name?.trim() || !newCoin.ticker?.trim()) {
      errorAlert("Name and ticker are required");
      return;
    }

    if (!publicKey) {
      console.log('error', `Send Transaction: Wallet not connected!`);
      return;
  }

    if (!user._id || !user.wallet) {
      errorAlert('Please connect your wallet first');
      return;
    }

    // Check wallet balance
    const balance = await checkWalletBalance(user.wallet);
    console.log(balance, user.wallet)
    if (balance < 0.1) { // Require 0.1 SOL minimum
      errorAlert('Insufficient SOL balance. You need at least 0.1 SOL to create a token');
      return;
    }

    
    const url = await uploadImage(imageUrl);
    
    if (!url) {
        throw new Error('Failed to upload image');
    }

    infoAlert(`Uploaded Image for ${newCoin.name}`);
    const coin: coinInfo = {
        ...newCoin,
        creator: user._id.toString(),
        url: url,
        reserveOne: 0,
        reserveTwo: 0,
        token: '', // This will be set by your backend
    };
    // send creation fee
    let signature: TransactionSignature = '';
    const recipientPubKey = new PublicKey(ADMINKEY)

    try {

      // Create instructions to send, in this case a simple transfer
      const instructions = [
          SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: recipientPubKey,
              lamports: CREATEFEE,
          }),
      ];

      // Get the lates block hash to use on our transaction and confirmation
      let latestBlockhash = await connection.getLatestBlockhash()

      // Create a new TransactionMessage with version and compile it to legacy
      const messageLegacy = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions,
      }).compileToLegacyMessage();

      // Create a new VersionedTransacction which supports legacy and v0
      const transation = new VersionedTransaction(messageLegacy)

      // Send transaction and await for signature
      signature = await sendTransaction(transation, connection);

      // Send transaction and await for signature
      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

      console.log(signature);
      
  } catch (error: any) {
      
      console.log('error', `Transaction failed! ${error?.message}`, signature);
      return;
  }
    const created = await createNewCoin(coin);
    
    if (created) {
        setIsCreated(created);
        setNewCoin({} as coinInfo);
        successAlert(`Successfully created ${coin.name}`);
        setImageUrl(''); // Clear the image
        setSelectedFileName(''); // Clear the filename
    } else {
        throw new Error('Failed to create coin');
    }
    router.push(`/trading/${created._id}`);
  } catch (error: any) {
    console.error("Error creating coin:", error);
    errorAlert(error.message || "Failed to create coin. Make sure you have enough SOL in your wallet.");
  } finally {
    setIsLoading(false);
    
  }
};

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        errorAlert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        errorAlert('File size must be less than 5MB');
        return;
      }

      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }

      setSelectedFileName(file.name);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        errorAlert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        errorAlert('File size must be less than 5MB');
        return;
      }

      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }

      setSelectedFileName(file.name);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      console.log(url)
    }
  };

  const handleRemoveImage = () => {
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl('');
    setSelectedFileName('');
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = document.getElementById('description') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    setNewCoin(prev => ({
      ...prev,
      description: before + emoji + after
    }));
    
    setShowEmojiPicker(false);
  };

  // Your existing JSX remains exactly the same
  return (
    <div className="w-full max-w-[500px] mx-auto px-4 sm:px-0 pb-20 relative">
      {/* Add loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      
      <div className={`${isLoading ? 'pointer-events-none' : ''}`}>
        <div className="flex justify-end mb-4">
          <Link href="/">
            <div className="inline-flex items-center gap-2 py-2 text-[#01a8dd] hover:text-white transition-colors duration-300 group">
              <IoArrowBack className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back</span>
            </div>
          </Link>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-white">
              Name*
            </label>
            <input
              type="text"
              id="name"
              value={newCoin.name}
              onChange={handleChange}
              className="modern-input w-full"
              placeholder="Enter token name"
              required
            />
          </div>

          <div>
            <label htmlFor="ticker" className="block mb-2 text-sm font-medium text-white">
              Ticker*
            </label>
            <input
              type="text"
              id="ticker"
              value={newCoin.ticker}
              onChange={handleChange}
              className="modern-input w-full"
              placeholder="Enter token ticker"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-white">
              Description (optional)
            </label>
            <div className="relative">
              <textarea
                id="description"
                value={newCoin.description}
                onChange={handleChange}
                className="modern-input w-full min-h-[120px] py-3 resize-y"
                placeholder="Enter token description"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute bottom-3 right-3 text-[#01a8dd] hover:text-white transition-colors text-sm font-medium"
                type="button"
              >
                Add emoji
              </button>
              {showEmojiPicker && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="relative bg-[#1a1a1a] rounded-lg p-4 shadow-xl">
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="absolute -top-3 -right-3 w-6 h-6 bg-[#1a1a1a] border border-[#01a8dd]/20 rounded-full flex items-center justify-center hover:border-[#01a8dd] hover:bg-[#01a8dd]/10 transition-all duration-200 z-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      autoFocusSearch={false}
                      theme={Theme.DARK}
                      searchPlaceHolder="Search emoji..."
                      width={300}
                      height={400}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-white">
            Add project image or video
          </label>
          <label 
            className={`file-input-label h-[200px] ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
            <div className="file-input-button h-full flex flex-col items-center justify-center">
              {imageUrl ? (
                <>
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-w-[140px] max-h-[100px] object-contain mb-3 rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage();
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-[#1a1a1a] border border-[#01a8dd]/20 rounded-full flex items-center justify-center hover:border-[#01a8dd] hover:bg-[#01a8dd]/10 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-[#01a8dd]/60">
                    {selectedFileName}
                  </span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-base mb-2">{selectedFileName || 'Choose File'}</span>
                  <span className="text-sm text-[#01a8dd]/60">
                    Drag and drop or click to select
                  </span>
                </>
              )}
            </div>
          </label>
        </div>
        <div className="flex justify-center mt-5">
          <button
            onClick={() => setVisible(!visible)}
            className="social-toggle-button"
          >
            <span>{visible ? 'Hide Socials' : 'Add Socials'}</span>
            {visible ? '−' : '+'} 
          </button>
        </div>
        {visible && (
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="twitter" className="block mb-2 text-sm font-medium text-white">
                X.com
              </label>
              <input
                type="text"
                id="twitter"
                value={newCoin.twitter}
                onChange={handleChange}
                className="modern-input w-full"
                placeholder="Enter X profile URL (optional)"
              />
            </div>

            <div>
              <label htmlFor="telegram" className="block mb-2 text-sm font-medium text-white">
                Telegram
              </label>
              <input
                type="text"
                id="telegram"
                value={newCoin.telegram}
                onChange={handleChange}
                className="modern-input w-full"
                placeholder="Enter Telegram group URL (optional)"
              />
            </div>

            <div>
              <label htmlFor="website" className="block mb-2 text-sm font-medium text-white">
                Website
              </label>
              <input
                type="text"
                id="website"
                value={newCoin.website}
                onChange={handleChange}
                className="modern-input w-full"
                placeholder="Enter website URL (optional)"
              />
            </div>
          </div>
        )}
        <div>
        <button
  className={`go-button w-full mt-[20px] justify-center 
              ${!user?._id || isCreate || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
  onClick={createCoin}
  disabled={!user?._id || isCreate || isLoading} // Disable if user._id is missing or if already creating/loading
>
  <span>{ !user?._id ? 'No User!' : isLoading ? "Creating..." : "Launch Token"}</span>
  <IoMdRocket size={30} />
</button>

        </div>
      </div>
    </div>
  );
}