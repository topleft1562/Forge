"use client";
import React, { ReactNode, useState } from "react";
import { PageProvider } from "@/contexts/PageContext";
import { SolanaWalletProvider } from "@/contexts/SolanaWalletProvider";
import { QueryClientProvider, QueryClient } from "react-query";
import { ToastContainer } from "react-toastify";
import { ModalProvider } from "@/contexts/ModalProvider";
import UserContext from "@/context/UserContext";
import { msgInfo, userInfo } from "@/utils/types";
import "dotenv/config.js";
import LoginContext from "@/context/CoinContex";
import SocketProvider from "@/contexts/SocketContext";

export const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  // Remove unused wallet import
  const [user, setUser] = useState<userInfo>({} as userInfo);
  const [login, setLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('/upload-bg.png');
  const [isCreated, setIsCreated] = useState(false);
  const [messages, setMessages] = useState<msgInfo[]>([]);
  
  return (
    <SolanaWalletProvider>
      <SocketProvider>
        <QueryClientProvider client={queryClient}>
          <ModalProvider>
            <PageProvider>
              <UserContext.Provider
                value={{
                  messages,
                  setMessages,
                  isCreated,
                  setIsCreated,
                  imageUrl,
                  setImageUrl,
                  user,
                  setUser,
                  login,
                  setLogin,
                  isLoading,
                  setIsLoading,
                }}
              >
                {children}
                <ToastContainer pauseOnFocusLoss={false} theme="colored" />
              </UserContext.Provider>
            </PageProvider>
          </ModalProvider>
        </QueryClientProvider>
      </SocketProvider>
    </SolanaWalletProvider>
  );
}