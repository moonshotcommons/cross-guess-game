# 🎲 CrossGuess - Cross-Chain Prediction Game

A real-time cross-chain prediction game powered by **Wormhole Settlement** and **Mayan Swift**. Players pay with ETH on Ethereum chain and winners receive SOL rewards on Solana - all through lightning-fast Settlement technology.

![CrossGuess](https://img.shields.io/badge/Game-Live-green)
![Settlement](https://img.shields.io/badge/Powered%20by-Wormhole%20Settlement-purple)
![Mayan](https://img.shields.io/badge/Route-Mayan%20Swift-blue)

## 🎮 What is CrossGuess?

CrossGuess demonstrates the power of **Settlement** - a revolutionary approach to cross-chain transfers that's faster and cheaper than traditional bridges. Players participate in real-time prediction games with actual cross-chain value transfer.

### ⚡ Game Flow:
```
1. Player pays 0.00001 ETH on Ethereum (~$0.04)
2. Mayan Settlement instantly converts ETH → SOL  
3. SOL goes into prize pool on Solana
4. Game runs for 2 minutes
5. Winners receive SOL rewards directly
```

### 🎯 Game Rules:
- **Entry Fee**: 0.00001 ETH (very small for testing)
- **Duration**: 2 minutes per round
- **Question**: "Guess the number between 1-5"
- **Winners**: Players who guess correctly split the SOL prize pool
- **Auto-Start**: Game begins when first player joins

## 🚀 Quick Start

### Prerequisites
- [Node.js 16+](https://nodejs.org/) installed
- **Mainnet wallets** with small amounts (Settlement only works on mainnet):
  - Ethereum wallet with ETH for gas and entry fees
  - Solana wallet for receiving rewards

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/crossguess-demo.git
cd crossguess-demo
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your REAL MAINNET private keys:
```

**⚠️ Important**: You need real mainnet private keys in `.env`:
```bash
MAINNET_ETH_PRIVATE_KEY=your_ethereum_wallet_private_key
MAINNET_SOL_PRIVATE_KEY=your_solana_wallet_private_key
```

### 3. Run CrossGuess

**Option 1: Full Game (Frontend + Backend)**
```bash
# Terminal 1: Start API server
npm run api

# Terminal 2: Start frontend
npm run dev
# Visit http://localhost:5173
```

**Option 2: CLI Testing**
```bash
# Quick test (no real transactions)
npm run test-quick

# Full test (real mainnet transactions!)
npm run test-game
```

## 🏗️ Architecture

### Frontend (React + Vite)
- **Mock Wallets**: Pre-connected demo wallets for easy testing
- **Real-time UI**: Live game status updates via API polling
- **Settlement Flow**: Visual representation of cross-chain transfers

### Backend (Express API)
- **Real Settlement**: Uses actual Mayan Swift for cross-chain transfers  
- **Game Logic**: 2-minute timer, random winner selection
- **Mock Players**: Auto-generates wallet addresses for demo

### Core Settlement Engine
- **Mayan Integration**: Real cross-chain ETH → SOL conversion
- **Small Amounts**: 0.00001 ETH per game (~$0.04)
- **Fast Settlement**: 30-second cross-chain transfers

## 🎯 API Endpoints

```bash
POST /api/join-game     # Join current game with guess
GET  /api/game-status   # Get real-time game state  
GET  /api/game-result   # Get game results
GET  /api/health        # API health check
```

## 💡 How Settlement Works

### Traditional Bridge:
```
Ethereum: Lock ETH → Wait 10-30 min → Solana: Mint wrapped ETH
```

### Settlement (Mayan):
```
Ethereum: Pay ETH → Solver provides SOL instantly → Settlement later
```

**Benefits:**
- ⚡ **Speed**: 30 seconds vs 30 minutes
- 💰 **Cost**: Lower fees through solver competition
- 🎮 **UX**: Perfect for real-time gaming

## 🧪 Testing & Development

### Safe Testing
```bash
# 1. Quick test (no money spent)
npm run test-quick

# 2. Small mainnet test (costs ~$0.04)
npm run test-game
```

### Development Mode
```bash
# Frontend only (connects to running API)
npm run dev

# API only (for backend development)
npm run api

# Original demos (for comparison)
npm run swap    # Basic Mayan Swift swap
npm run game    # Original CLI game
```

## 🔧 Configuration

### Game Settings
Edit `src/core/simple-game.ts`:
```typescript
const gameConfig = {
  duration: 120,        // 2 minutes
  entryFee: "0.00001",  // Very small for testing
  maxParticipants: 5    // Game limit
};
```

### Chain Settings
Edit `src/core/game.ts`:
```typescript
const sendChain = wh.getChain("Ethereum");     // Payment chain
const destChain = wh.getChain("Solana");   // Reward chain
```


## 🙏 Acknowledgments

- **Wormhole Foundation** - For Settlement infrastructure
- **Mayan Finance** - For Swift routing and solver network
- **Community** - For testing and feedback

---

**⚠️ Disclaimer**: This is educational software demonstrating Settlement technology. Always test with small amounts and understand the risks of cross-chain transactions. Not for production gambling use.