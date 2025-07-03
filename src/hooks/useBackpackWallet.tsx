import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { WalletContext, WalletContextType } from "./WalletContext";

const GOR_RPC = "https://rpc.gorbagana.wtf";

export function WalletProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [balance, setBalance] = useState<number | null>(null);
  const [wallet] = useState(() => new BackpackWalletAdapter());
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const connection = useMemo(() => new Connection(GOR_RPC, "confirmed"), []);

  const connect = useCallback(async () => {
    try {
      await wallet.connect();
      setConnected(true);
      setPublicKey(wallet.publicKey);
    } catch (e) {
      setConnected(false);
      setPublicKey(null);
    }
  }, [wallet]);

  const disconnect = useCallback(async () => {
    try {
      await wallet.disconnect();
    } finally {
      setConnected(false);
      setPublicKey(null);
      setBalance(null);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      setConnected(true);
      setPublicKey(wallet.publicKey);
    } else {
      setConnected(false);
      setPublicKey(null);
    }
  }, [wallet.connected, wallet.publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      connection.getBalance(publicKey).then((lamports) => {
        setBalance(lamports / 1e9); // $GOR is 1e9 lamports
      });
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);

  return (
    <WalletContext.Provider
      value={{ connect, disconnect, connected, publicKey, balance, wallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}
