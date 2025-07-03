import { createContext } from "react";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import type { PublicKey } from "@solana/web3.js";

export interface WalletContextType {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number | null;
  wallet: WalletAdapter | null;
}

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);
