import { Metaplex, BundlrStorageDriver, toMetaplexFile } from "@metaplex-foundation/js";
import {Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import "dotenv/config";
import bs58 from "bs58";
import fs from "fs";

const connection = new Connection(process.env.RPC, {
    confirmTransactionInitialTimeout: 120000,
}
);
const wallet = Keypair.fromSecretKey(bs58.decode(process.env.TREASURY));
