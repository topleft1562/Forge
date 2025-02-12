"use client";

import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { FaWallet } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

import { successAlert, errorAlert, infoAlert } from "@/components/ToastGroup";
import base58 from "bs58";
import UserContext from "@/context/UserContext";
import { confirmWallet, walletConnect } from "@/utils/util";
import { userInfo } from "@/utils/types";
import Link from "next/link";

const DEFAULT_AVATAR = '/default-avatar.png'; 

export const ConnectButton: FC = () => {
  const { user, setUser, login, setLogin, isLoading, setIsLoading } =
    useContext(UserContext);
  const { publicKey, disconnect, connect, signMessage } = useWallet();
  const { visible, setVisible } = useWalletModal();

  const tempUser = useMemo(() => user, [user]);
  useEffect(() => {
    const handleClick = async () => {
      if (publicKey && !login) {
        const updatedUser: userInfo = {
          name: publicKey.toBase58().slice(0, 6),
          wallet: publicKey.toBase58(),
          isLedger: false,
        };
        await sign(updatedUser);
      }
    };
    handleClick();
  }, [publicKey, login]); // Removed `connect`, `wallet`, and `disconnect` to prevent unnecessary calls

const sign = async (updatedUser: userInfo) => {
    try {
        const connection = await walletConnect({ data: updatedUser });
        if(!connection) {
            errorAlert("Connection failed");
            return;
        }
        
        if (connection.nonce === undefined) {
            console.log('Using existing connection:', connection);
            const newUser = {
                name: connection.name,
                wallet: connection.wallet,
                _id: connection._id,
                avatar: connection.avatar,
            };
            setUser(newUser as userInfo);
            setLogin(true);
            return;
        }

        console.log('Preparing to sign message with nonce:', connection.nonce);
        const msg = new TextEncoder().encode(
            `${process.env.NEXT_PUBLIC_SIGN_IN_MSG || 'Sign this message for authenticating with your wallet'} ${connection.nonce}`
        );
        
        if (!signMessage) {
            errorAlert("Signing not available");
            return;
        }

        const sig = await signMessage(msg);
        const res = base58.encode(sig as Uint8Array);
        
        const signedWallet = { 
            ...connection, 
            signature: res,
            // Make sure all required fields are present
            name: connection.name,
            wallet: connection.wallet,
            nonce: connection.nonce,
            isLedger: connection.isLedger || false
        };
        
        console.log('Sending confirmation with data:', signedWallet);
        const confirm = await confirmWallet({ data: signedWallet });

        if (confirm) {
            setUser(confirm);
            setLogin(true);
            setIsLoading(false);
            successAlert("Successfully connected!");
        } else {
            errorAlert("Confirmation response was empty");
        }
    } catch (error) {
        console.error('Sign-in error:', error);
        errorAlert(error.message || "Sign-in failed");
    }
};

  const logOut = async () => {
    if (typeof disconnect === "function") {
      await disconnect();
    }
    // Initialize `user` state to default value
    setUser({} as userInfo);
    setLogin(false);
    localStorage.clear();
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallet-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative wallet-dropdown-container">
      <button 
        className="wallet-button px-4 py-2 rounded-lg flex items-center gap-2 text-light font-medium min-w-[160px] border border-[#01a8dd]/20"
        onClick={() => login && publicKey ? setIsDropdownOpen(!isDropdownOpen) : setVisible(true)}
      >
        {login && publicKey ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FaWallet className="text-[#01a8dd]" size={20} />
              <span className="font-mono">
                {publicKey.toBase58().slice(0, 4)}...
                {publicKey.toBase58().slice(-4)}
              </span>
            </div>
            <IoMdArrowDropdown size={20} />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full">
            <FaWallet className="text-[#01a8dd]" size={20} />
            <span>Connect Wallet</span>
            <IoMdArrowDropdown size={20} />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {login && publicKey && isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-dark-surface rounded-lg shadow-modern border border-primary/10 z-50">
          <button
            onClick={() => {
              setVisible(true);
              setIsDropdownOpen(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-[#01a8dd]/10 transition-colors"
          >
            Change Wallet
          </button>
          <button
            onClick={() => {
              logOut();
              setIsDropdownOpen(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-[#01a8dd]/10 transition-colors text-red-500"
          >
            Disconnect
          </button>

          {login && tempUser && tempUser._id && (
            <Link href={`/profile/${tempUser._id}`} onClick={() => setIsDropdownOpen(false)}>
              <div className="w-full px-4 py-2 text-left hover:bg-[#01a8dd]/10 transition-colors">
                View Profile
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
