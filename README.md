# Solana NFT Project

A complete Solana NFT minting program built with [Anchor Framework](https://www.anchor-lang.com/). This project implements a Metaplex-compliant NFT minting system that allows users to create unique digital assets on the Solana blockchain.

## 🚀 Features

- **Metaplex Standard Compliance**: Full compatibility with Metaplex token metadata standards
- **Master Edition NFTs**: Creates master edition NFTs with proper metadata and edition handling
- **Anchor Framework**: Built with Anchor for secure, efficient Solana program development
- **TypeScript SDK**: Complete TypeScript bindings for easy integration
- **Comprehensive Testing**: Full test suite for reliable deployment

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Building](#building)
- [Testing](#testing)
- [Deployment](#deployment)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## 🏗️ Project Structure

```
solana-nft/
├── programs/
│   └── nft/                    # Anchor program
│       ├── src/
│       │   └── lib.rs         # Main program logic
│       ├── Cargo.toml         # Rust dependencies
│       └── Xargo.toml         # Cross-compilation config
├── tests/
│   └── nft.ts                 # TypeScript tests
├── migrations/
│   └── deploy.ts              # Deployment script
├── app/                       # Frontend application (if applicable)
├── target/                    # Build artifacts
│   └── types/
│       └── metaplex_nft.ts    # Generated TypeScript types
├── Anchor.toml               # Anchor configuration
├── Cargo.toml                # Workspace configuration
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Rust**: Latest stable version ([Install Rust](https://rustup.rs/))
- **Node.js**: Version 16.0 or higher ([Install Node.js](https://nodejs.org/))
- **Yarn**: Package manager ([Install Yarn](https://yarnpkg.com/))
- **Solana CLI**: For local development ([Install Solana CLI](https://docs.solana.com/cli/install-solana-cli-tool))
- **Anchor CLI**: Framework CLI tools ([Install Anchor](https://www.anchor-lang.com/docs/installation))

### Verify Installation

```bash
# Check Rust installation
rustc --version
cargo --version

# Check Node.js installation
node --version
npm --version
yarn --version

# Check Solana CLI
solana --version

# Check Anchor CLI
anchor --version
```

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solana-nft
   ```

2. **Install dependencies**
   ```bash
   # Install Rust dependencies
   cargo build

   # Install Node.js dependencies
   yarn install
   ```

3. **Set up local Solana environment**
   ```bash
   # Start local validator
   solana-test-validator

   # In a new terminal, configure Solana CLI for local development
   solana config set --url localhost
   ```

## 🔧 Development Setup

1. **Configure Anchor for local development**
   ```bash
   # Set provider to local cluster
   anchor config localnet
   ```

2. **Generate program keypair** (if not already present)
   ```bash
   # Generate a new keypair for the program
   solana-keygen new --outfile ./target/deploy/nft-keypair.json
   ```

3. **Build the program**
   ```bash
   # Build the Anchor program
   anchor build

   # This generates:
   # - Rust binary in ./target/deploy/
   # - TypeScript types in ./target/types/
   # - IDL file for client integration
   ```

## 🏗️ Building

### Build for Development

```bash
# Build the program
anchor build

# Build with verbose output
anchor build --verbose
```

### Build for Production

```bash
# Release build with optimizations
anchor build --release

# Build and verify the program
anchor build --verifiable
```

## 🧪 Testing

### Run All Tests

```bash
# Run TypeScript tests using Mocha
yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts

# Or use the script defined in Anchor.toml
anchor test
```

### Run Specific Test

```bash
# Run a specific test file
yarn run ts-mocha -p ./tsconfig.json tests/nft.ts

# Run with debugging
DEBUG=* yarn run ts-mocha -p ./tsconfig.json tests/nft.ts
```

### Test Coverage

The test suite includes:
- **NFT Minting**: Tests the core `mint_nft` instruction
- **Multiple NFT Creation**: Tests batch minting capabilities
- **Metadata Validation**: Verifies Metaplex metadata creation
- **Token Account Verification**: Ensures proper token distribution

## 🚀 Deployment

### Deploy to Localnet

```bash
# Deploy to local cluster for testing
anchor deploy --provider.cluster localnet

# Or use the migration script
anchor run deploy
```

### Deploy to Devnet

```bash
# Configure for devnet
solana config set --url devnet
anchor config devnet

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show D3u3yoREWYScre6iTUdVowuGeaTQt8xUR8ejFmWMRmoT
```

### Deploy to Mainnet

```bash
# Configure for mainnet
solana config set --url mainnet-beta
anchor config mainnet-beta

# Deploy to mainnet (use with caution!)
anchor deploy --provider.cluster mainnet-beta
```

## 📖 Usage

### Basic NFT Minting

```typescript
import { Program } from "@coral-xyz/anchor";
import { Nft } from "./target/types/nft";
import { Keypair, PublicKey } from "@solana/web3.js";

const program = anchor.workspace.nft as Program<Nft>;
const provider = anchor.AnchorProvider.env();

// Generate mint keypair
const mintKeypair = Keypair.generate();

// Derive PDAs
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

// Mint NFT
await program.methods
  .mintNft("My NFT", "NFT", "https://arweave.net/metadata")
  .accounts({
    signer: provider.wallet.publicKey,
    mint: mintKeypair.publicKey,
    associatedTokenAccount: associatedTokenAccount,
    metadataAccount,
    masterEditionAccount,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
    tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    systemProgram: anchor.web3.SystemProgram.programId,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  })
  .signers([mintKeypair])
  .rpc();
```

### Using the SDK

```typescript
import { NftClient } from "./target/types/nft";

const client = new NftClient(provider.connection, provider.wallet);

// Mint NFT with simplified interface
const signature = await client.mintNft({
  name: "Awesome NFT",
  symbol: "AWESOME",
  uri: "https://arweave.net/awesome-nft-metadata",
  mintKeypair: Keypair.generate(),
});
```

## 🔌 API Reference

### Instructions

#### `mint_nft`

Creates a new NFT with metadata and master edition.

**Parameters:**
- `name: String` - The name of the NFT
- `symbol: String` - The symbol/ticker for the NFT
- `uri: String` - The URI pointing to the NFT metadata (typically on Arweave)

**Accounts:**
- `signer` (mut, signer) - The account paying for the transaction
- `mint` (mut) - The mint account for the NFT
- `associated_token_account` (mut) - The associated token account receiving the NFT
- `metadata_account` (mut) - The Metaplex metadata account
- `master_edition_account` (mut) - The Metaplex master edition account
- `token_program` - The SPL Token Program
- `associated_token_program` - The SPL Associated Token Program
- `token_metadata_program` - The Metaplex Token Metadata Program
- `system_program` - The Solana System Program
- `rent` - The Solana Rent Sysvar

### Events

The program emits the following events:

- `NftMinted` - Emitted when a new NFT is successfully created

## 🛠️ Development Workflow

### Code Organization

- **Program Logic**: `programs/nft/src/lib.rs`
- **Rust Tests**: `programs/nft/src/tests/`
- **TypeScript Tests**: `tests/`
- **Client SDK**: `target/types/`

### Adding New Features

1. **Update Rust Program**
   ```bash
   # Edit lib.rs with new instruction
   code programs/nft/src/lib.rs
   ```

2. **Build and Generate Types**
   ```bash
   # Build program and generate TypeScript types
   anchor build
   ```

3. **Add Tests**
   ```bash
   # Add TypeScript tests in tests/
   code tests/new_feature_test.ts
   ```

4. **Test Implementation**
   ```bash
   # Run tests to verify functionality
   anchor test
   ```

### Debugging

```bash
# Run tests with debugging output
DEBUG=* anchor test

# Use Solana logs for program debugging
solana logs --url localhost

# Check program account data
solana account <ACCOUNT_ADDRESS> --url localhost
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow [Anchor Framework Best Practices](https://www.anchor-lang.com/docs/best-practices)
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the [Issues](../../issues) page for similar problems
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/solana) for discussions

## 🙏 Acknowledgments

- [Anchor Framework](https://www.anchor-lang.com/) - For the amazing Solana development experience
- [Metaplex Program Library](https://github.com/metaplex-foundation/metaplex-program-library) - For NFT standards
- [Solana Labs](https://solana.com/) - For the high-performance blockchain

---

**Happy minting! 🚀**