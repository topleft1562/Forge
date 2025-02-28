import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode, useMemo } from "react";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

require("@solana/wallet-adapter-react-ui/styles.css");

export const SolanaWalletProvider = ({ children }: { children: ReactNode }) => {
  
  const mainNetwork = WalletAdapterNetwork.Mainnet
  const testNetwork = WalletAdapterNetwork.Devnet

  const isTest = process.env.NEXT_PUBLIC_CHAIN === 'testnet'
  const network = isTest ? testNetwork : mainNetwork

  const SOLANA_RPC = process.env.NEXT_PUBLIC_RPC_ENDPOINT; // Replace with your custom RPC URL
  const endpoint = useMemo(() => SOLANA_RPC, []);
  
  // Or use your custom RPC if you have one for Devnet
  // const endpoint = SOLANA_RPC; // Make sure this is pointing to a Devnet RPC

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: isTest ? testNetwork : undefined }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};