import express from 'express';
import cors from 'cors';
import { demoGameManager } from '../core/demo-game';
import { gameManager as realGameManager } from '../core/simple-game';

// Game manager instances
let demoManager = demoGameManager;
let realManager = realGameManager;

// Dynamically select game manager based on request
function getGameManager(isDemoMode: boolean) {
  return isDemoMode ? demoManager : realManager;
}

// Get real wallet address from environment variables (for educational purposes)
function getRealWalletAddress(): string | null {
  try {
    const privateKey = process.env.MAINNET_ETH_PRIVATE_KEY;
    if (!privateKey || privateKey === 'your_ethereum_private_key_here') {
      return null;
    }
    // Simply return a sample address, should actually be derived from private key
    // For educational simplicity, return a fixed demo address here
    return '0x' + privateKey.substring(0, 40).padEnd(40, '0');
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    return null;
  }
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Mock wallet addresses for demo
const MOCK_WALLETS = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  '0x4567890123456789012345678901234567890123',
  '0x5678901234567890123456789012345678901234'
];

let currentMockWalletIndex = 0;

/**
 * Get next mock wallet address
 */
function getNextMockWallet(): string {
  const wallet = MOCK_WALLETS[currentMockWalletIndex];
  currentMockWalletIndex = (currentMockWalletIndex + 1) % MOCK_WALLETS.length;
  return wallet;
}

/**
 * POST /api/join-game
 * Join the current game with a guess
 */
app.post('/api/join-game', async (req, res) => {
  try {
    console.log('📥 Received join-game request:', req.body);
    const { guess, demoMode = true } = req.body;
    
    // Ensure demoMode is a boolean
    const isDemoMode = demoMode === true || demoMode === 'true' || demoMode === undefined;
    
    if (typeof guess !== 'number' || guess < 1 || guess > 5) {
      return res.status(400).json({
        success: false,
        error: 'Guess must be a number between 1 and 5'
      });
    }

    // Select game manager based on mode
    const gameManager = getGameManager(isDemoMode);
    console.log(`🎮 Using ${isDemoMode ? 'DEMO' : 'REAL'} mode (demoMode=${demoMode}, isDemoMode=${isDemoMode})`);
    
    // Get player address
    let playerAddress: string;
    
    if (isDemoMode) {
      // Demo mode: use mock wallet
      playerAddress = getNextMockWallet();
    } else {
      // Real mode: use private key wallet from environment variables
      playerAddress = getRealWalletAddress() || '';
      
      if (!playerAddress) {
        return res.status(400).json({
          success: false,
          error: 'Please configure MAINNET_ETH_PRIVATE_KEY in .env file first'
        });
      }
    }
    
    console.log(`🎮 API: Player ${playerAddress} joining with guess ${guess}`);

    const result = await gameManager.joinGame(playerAddress, guess);

    console.log('🎯 Game join result:', result);

    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
        gameId: result.gameId,
        playerAddress: playerAddress,
        message: 'Successfully joined the game!'
      });
    } else {
      console.error('❌ Game join failed:', result);
      res.status(400).json({
        success: false,
        error: 'Failed to join game - Check console for details'
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/game-status
 * Get current game status
 */
app.get('/api/game-status', (req, res) => {
  try {
    const demoMode = req.query.demoMode !== 'false'; // Default to true
    const gameManager = getGameManager(demoMode);
    
    const gameStatus = gameManager.getGameStatus();
    const timeRemaining = gameManager.getTimeRemaining();
    const canJoin = gameManager.canJoinGame();

    res.json({
      success: true,
      game: gameStatus,
      timeRemaining,
      canJoin
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game status'
    });
  }
});

/**
 * GET /api/game-result
 * Get the result of the current/last game
 */
app.get('/api/game-result', (req, res) => {
  try {
    const demoMode = req.query.demoMode !== 'false'; // Default to true
    const gameManager = getGameManager(demoMode);
    
    const gameStatus = gameManager.getGameStatus();
    
    if (!gameStatus) {
      return res.status(404).json({
        success: false,
        error: 'No game found'
      });
    }

    res.json({
      success: true,
      game: gameStatus,
      isEnded: gameStatus.status === 'ended',
      correctAnswer: gameStatus.correctAnswer,
      winner: gameStatus.winner,
      participants: gameStatus.participants.length
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game result'
    });
  }
});

/**
 * GET /api/wallet-info
 * Get wallet info for real mode
 */
app.get('/api/wallet-info', (req, res) => {
  const walletAddress = getRealWalletAddress();
  
  res.json({
    success: true,
    hasWallet: !!walletAddress,
    address: walletAddress || null,
    message: walletAddress ? 
      'Private key wallet configured' : 
      'Please configure MAINNET_ETH_PRIVATE_KEY in .env file'
  });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CrossGuess API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 CrossGuess API server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🎮 Game status: http://localhost:${PORT}/api/game-status`);
  });
}

export { app }; 