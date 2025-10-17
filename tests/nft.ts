// @ts-nocheck

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MetaplexNft } from "../target/types/metaplex_nft";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  getMint,
} from "@solana/spl-token";
import { assert } from "chai";

describe("nft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.nft as Program<MetaplexNft>;
  const provider = anchor.AnchorProvider.env();

  // Generate keypairs for testing
  const mintKeypair = Keypair.generate();
  const recipient = provider.wallet.publicKey;

  it("Mint NFT", async () => {
    // NFT metadata
    const name = "Test NFT";
    const symbol = "TEST";
    const uri = "https://arweave.net/your-nft-metadata";

    // Derive PDAs for metadata and master edition accounts
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [masterEditionAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mintKeypair.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    // Derive associated token account
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      recipient
    );

    console.log("Minting NFT...");
    console.log("Mint:", mintKeypair.publicKey.toString());
    console.log("Metadata:", metadataAccount.toString());
    console.log("Master Edition:", masterEditionAccount.toString());
    console.log("Associated Token Account:", associatedTokenAccount.toString());

    // Mint the NFT
    const tx = await program.methods
      .mintNft(name, symbol, uri)
      .accounts({
        signer: recipient,
        mint: mintKeypair.publicKey,
        associatedTokenAccount,
        metadataAccount,
        masterEditionAccount,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        tokenMetadataProgram: new PublicKey(
          "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        ),
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc();

    console.log("NFT minted successfully!");
    console.log("Transaction signature:", tx);

    // Verify the mint was created successfully
    const mintInfo = await getMint(provider.connection, mintKeypair.publicKey);
    assert.equal(mintInfo.supply, BigInt(1));
    assert.equal(mintInfo.decimals, 0);

    // Verify the associated token account received the token
    const tokenAccount = await getAccount(
      provider.connection,
      associatedTokenAccount
    );
    assert.equal(tokenAccount.amount, BigInt(1));

    console.log("✅ NFT minting test passed!");
  });

  it("Mint multiple NFTs", async () => {
    // Test minting multiple NFTs with different metadata
    const nfts = [
      { name: "NFT #1", symbol: "NFT1", uri: "https://arweave.net/nft1" },
      { name: "NFT #2", symbol: "NFT2", uri: "https://arweave.net/nft2" },
    ];

    for (let i = 0; i < nfts.length; i++) {
      const nftMint = Keypair.generate();
      const nftData = nfts[i];

      const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          new PublicKey(
            "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
          ).toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
      );

      const [masterEditionAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          new PublicKey(
            "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
          ).toBuffer(),
          nftMint.publicKey.toBuffer(),
          Buffer.from("edition"),
        ],
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
      );

      const associatedTokenAccount = await getAssociatedTokenAddress(
        nftMint.publicKey,
        recipient
      );

      await program.methods
        .mintNft(nftData.name, nftData.symbol, nftData.uri)
        .accounts({
          signer: recipient,
          mint: nftMint.publicKey,
          associatedTokenAccount,
          metadataAccount,
          masterEditionAccount,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          tokenMetadataProgram: new PublicKey(
            "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
          ),
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([nftMint])
        .rpc();

      console.log(`✅ Minted ${nftData.name} successfully`);
    }

    console.log("✅ Multiple NFT minting test passed!");
  });
});
