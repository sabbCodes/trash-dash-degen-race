import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-adapter-base";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GOR_RPC = "https://rpc.gorbagana.wtf";
const TREASURY_ADDRESS = "A1HZPreiQwsSo4HzEQ5FbvTG8m9WyfptfRc4TxWBmYuA";

export async function sendEntryFee(wallet: WalletAdapter) {
  const connection = new Connection(GOR_RPC, "confirmed");
  const treasuryPubkey = new PublicKey(TREASURY_ADDRESS);
  const amount = 5 * 1e9; // 5 $GOR in lamports

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey!,
      toPubkey: treasuryPubkey,
      lamports: amount,
    })
  );

  // Use skipPreflight to bypass simulation on Gorbagana
  return await wallet.sendTransaction(tx, connection, { skipPreflight: true });
}
