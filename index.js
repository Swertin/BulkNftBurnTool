// import "dotenv/config";
import bs58 from "bs58";
import fs from "fs";


import { PublicKey, Keypair, Connection, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { programs, actions, NodeWallet } from "@metaplex/js";
import { TOKEN_PROGRAM_ID, createBurnCheckedInstruction, createCloseAccountInstruction, getOrCreateAssociatedTokenAccount, createMintToInstruction } from "@solana/spl-token"
import { createBurnNftInstruction } from "@metaplex-foundation/mpl-token-metadata";
import { Metaplex, keypairIdentity, BundlrStorageDriver, toMetaplexFile } from "@metaplex-foundation/js";
import "dotenv/config";

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

const METAPLEX_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const getTokenWallet = async function (
    wallet,
    mint,
) {
    return (
        await PublicKey.findProgramAddress(
            [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        )
    )[0];
};
const getMetadataAccount = async function (
    wallet,
    mint,
) {
    return (
        await PublicKey.findProgramAddress(
            [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            METAPLEX_TOKEN_METADATA_PROGRAM_ID,
        )
    )[0];
};
async function burnNFT(connection, treasuryKeypair, nftObj) {
    try {
        const wallet = new NodeWallet(treasuryKeypair);
        const tokenWallet = await getTokenWallet(wallet.publicKey, nftObj.mintAddress);
        console.log("Token Wallet:", tokenWallet.toString(), "Treasury:", treasuryKeypair.publicKey.toString(), "Token:", nftObj.mintAddress.toString(), "Metadata:", nftObj.metadataAddress.toString(), "Edition:", nftObj.edition.address.toString());

        const { blockhash } = await (connection.getLatestBlockhash('finalized'))
        const burnAndClose = new Transaction({
            recentBlockhash: blockhash,
            // The buyer pays the transaction fee
            feePayer: treasuryKeypair.publicKey,
        })

        const burnNFTIx = createBurnNftInstruction(
            {
                metadata: nftObj.metadataAddress,
                owner: wallet.publicKey,
                mint: nftObj.mintAddress,
                tokenAccount: tokenWallet,
                masterEditionAccount: nftObj.edition.address,
                splTokenProgram: TOKEN_PROGRAM_ID,
            }
        );
        burnAndClose.add(burnNFTIx);
        const burnAndCloseTx = await sendAndConfirmTransaction(connection, burnAndClose, [treasuryKeypair]);

        // let txFinalized = false;
        const returnArrayPacket = {
            Success: true,
            burnNFT: burnAndCloseTx
        }

        return returnArrayPacket;
    }
    catch (err) {
        console.error(err);
        const returnArrayPacket = {
            Success: false,
            burnNFT: ""
        }
        return returnArrayPacket;
    }
}

async function runCriticalTX(connection, treasuryKeypair, nftsToUpdate) {
    const metaplex = Metaplex.make(connection);
    console.log(nftsToUpdate);
    const nftsToUpdateArray = nftsToUpdate.map(nft => new PublicKey(nft));
    console.log("NFTs to Burn:", nftsToUpdateArray);
    const lazyNfts = await metaplex.nfts().findAllByMintList(nftsToUpdateArray).run();
    const nfts = await Promise.all(lazyNfts.map(async nft => {
        try {
            const activeNft = await metaplex.nfts().loadNft(nft).run();
            return activeNft;
        } catch (error) {
            
        }
    }));
    console.log("NFTs:", nfts);
    let receivableImploded = nfts;
    let returnObj;
    while (receivableImploded.length > 0) {
        const failedArray = new Array;
        let delay = 0;
        await Promise.all(receivableImploded.map(async (nftObj) => {            //Select function
            await timeout((delay++) * 15);
            const returnArrayPacket = await burnNFT(connection, treasuryKeypair, nftObj);
            if (returnArrayPacket.Success) {
                console.log("Successfully burned NFT");
                returnObj = returnArrayPacket.burnNFT;
            }
            else if (!returnArrayPacket.Success) {

                failedArray.push(nftObj);
                console.log("Failed to burn");
            }

        }));
        receivableImploded = failedArray;
        console.log("Failed to burn:", receivableImploded.length);
        await timeout(10000);
    }

    console.log("Succeeded, generated:", returnObj);
}
function timeout(ms) {
    // console.log("Wait:", ms);
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function updateNFTS() {
    const connection = new Connection(process.env.RPC, {
        confirmTransactionInitialTimeout: 60000,
        commitment: "confirmed"
    })
    const treasuryPrivateKey = process.env.TREASURY
    const treasuryKeypair = Keypair.fromSecretKey(bs58.decode(treasuryPrivateKey))

    console.log("Pubkey:", treasuryKeypair.publicKey.toString());

    const hashList = [
        "B56zRuUzDr21EhENrKtR5nmjyni66XxDKuTArbzZcfhg"
    ];

    await runCriticalTX(connection, treasuryKeypair, hashList);
}

const createATA = async(connection, senderKeypair, testMints) => {
    const tokenPubKey = new PublicKey(testMints[0]);
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderKeypair,
        tokenPubKey,
        senderKeypair.publicKey
    );
    return toTokenAccount;
}

const mintToken = async (connection, senderKeypair, token, ATA) => {
    const metaplex = Metaplex.make(connection);

    const tokenPubKey = new PublicKey(token);
    const { blockhash } = await (connection.getLatestBlockhash('finalized'))
    // console.log("Got blockhash", blockhash);
    const mintNFT = new Transaction({
        recentBlockhash: blockhash,
        // The buyer pays the transaction fee
        feePayer: senderKeypair.publicKey,
    })
    const nft = await metaplex.nfts().findByMint(tokenPubKey).run();
    const mintToIX = createMintToInstruction(tokenPubKey,ATA.address,senderKeypair.publicKey,1);
    mintNFT.add(mintToIX);
    const mintTX = await sendAndConfirmTransaction(connection, mintNFT, [senderKeypair]);
    return mintTX;
}

const fetchTokens = async (connection, senderKeypair) => {
    const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters: [
                {
                    dataSize: 165,
                },
                {
                    memcmp: {
                        offset: 32,
                        bytes: senderKeypair.publicKey.toString(),
                    },
                },
            ],
        }
    );
    const tokens = accounts.map(accountInfo => accountInfo?.account?.data?.parsed?.info)
    // .filter(token => console.log(token) && (token.owner == senderKeypair.publicKey.toString()))
    .map(token => token.mint);
    console.log(tokens);
    return tokens;
};
updateNFTS();