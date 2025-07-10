# Viewm - Web3 Smart Contract Demo

A modern web3 application demonstrating interaction with Ethereum smart contracts using Next.js and Foundry.

## Features

- Counter Contract: Basic state management and transactions
- Name Registry Contract: Complex contract interactions with payments
- Modern UI with dark theme
- Real-time transaction history
- Wallet integration (Browser Wallet & WalletConnect)
- Foundry for smart contract development and testing

## Project Structure

```
viewm/
├── contracts/           # Smart contracts and tests
│   ├── src/            # Contract source files
│   ├── test/           # Contract test files
│   └── script/         # Deployment scripts
└── frontend/           # Next.js frontend application
    ├── src/
    │   ├── app/        # Next.js app router
    │   ├── components/ # React components
    │   └── config/     # Configuration files
    └── public/         # Static assets
```

## Getting Started

### Prerequisites

- Node.js 16+
- Foundry
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd viewm
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Install Foundry dependencies:
   ```bash
   cd ../contracts
   forge install
   ```

### Development

1. Start local blockchain:

   ```bash
   cd contracts
   anvil
   ```

2. Deploy contracts:

   ```bash
   forge script script/Counter.s.sol --broadcast --fork-url http://localhost:8545
   forge script script/NameRegistry.s.sol --broadcast --fork-url http://localhost:8545
   ```

3. Start frontend development server:

   ```bash
   cd ../frontend
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

### Smart Contracts

```bash
cd contracts
forge test
```

### Frontend

```bash
cd frontend
npm test
```

## License

MIT
