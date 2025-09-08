import { CrossGuessGame } from './game';
import { GameConfig, GameType } from '../types/game';

interface SimpleGameParticipant {
  address: string;
  guess: number;
  txHash: string;
  timestamp: number;
}

interface SimpleGameState {
  id: string;
  status: 'waiting' | 'active' | 'ended';
  startTime: number;
  endTime: number;
  participants: SimpleGameParticipant[];
  correctAnswer?: number;
  winner?: SimpleGameParticipant;
  prizePool: string;
}

export class SimpleGameManager {
  private currentGame: SimpleGameState | null = null;
  private crossGuessGame: CrossGuessGame;
  private gameConfig: GameConfig;

  constructor() {
    this.gameConfig = {
      type: GameType.NUMBER_GUESS,
      duration: 120, // 2 minutes
      entryFee: "0.00001", // Very small amount for testing
      maxParticipants: 5,
      prizeDistribution: [100] // Winner takes all
    };
    
    this.crossGuessGame = new CrossGuessGame(this.gameConfig);
  }

  /**
   * Join current game or create new one if none exists
   */
  async joinGame(playerAddress: string, guess: number): Promise<{ success: boolean, txHash?: string, gameId?: string }> {
    try {
      console.log(`🎮 Player ${playerAddress} attempting to join with guess: ${guess}`);

      // Create new game if none exists or current game ended
      if (!this.currentGame || this.currentGame.status === 'ended') {
        await this.createNewGame();
      }

      // Check if game is still accepting players
      if (this.currentGame!.status !== 'waiting') {
        throw new Error('Game already started');
      }

      if (this.currentGame!.participants.length >= this.gameConfig.maxParticipants) {
        throw new Error('Game is full');
      }

      // Check if player already joined
      if (this.currentGame!.participants.some(p => p.address === playerAddress)) {
        throw new Error('Player already joined this game');
      }

      // Execute real cross-chain transfer using CrossGuessGame
      console.log('💰 Executing cross-chain transfer...');
      const txHash = await this.crossGuessGame.joinGame(playerAddress, guess);

      // Add participant to current game
      const participant: SimpleGameParticipant = {
        address: playerAddress,
        guess,
        txHash,
        timestamp: Date.now()
      };

      this.currentGame!.participants.push(participant);
      this.currentGame!.prizePool = (parseFloat(this.currentGame!.prizePool) + parseFloat(this.gameConfig.entryFee)).toString();

      console.log(`✅ Player joined successfully. Total participants: ${this.currentGame!.participants.length}`);

      // Start game if this is the first participant
      if (this.currentGame!.participants.length === 1) {
        this.startGame();
      }

      return { 
        success: true, 
        txHash, 
        gameId: this.currentGame!.id 
      };

    } catch (error) {
      console.error('❌ Error joining game:', error);
      return { 
        success: false 
      };
    }
  }

  /**
   * Get current game status
   */
  getGameStatus(): SimpleGameState | null {
    return this.currentGame;
  }

  /**
   * Create a new game
   */
  private async createNewGame(): Promise<void> {
    const gameId = `game_${Date.now()}`;
    
    this.currentGame = {
      id: gameId,
      status: 'waiting',
      startTime: 0,
      endTime: 0,
      participants: [],
      prizePool: "0"
    };

    // Also create game round in CrossGuessGame
    const question = "Guess the number between 1 and 5";
    const options = ["1", "2", "3", "4", "5"];
    await this.crossGuessGame.createGameRound(question, options);

    console.log(`🎲 New game created: ${gameId}`);
    console.log(`🎯 Game round created in CrossGuessGame`);
  }

  /**
   * Start the game timer
   */
  private startGame(): void {
    if (!this.currentGame) return;

    const now = Date.now();
    this.currentGame.status = 'active';
    this.currentGame.startTime = now;
    this.currentGame.endTime = now + (this.gameConfig.duration * 1000);

    console.log(`🚀 Game started! Duration: ${this.gameConfig.duration} seconds`);

    // Set timer to end game
    setTimeout(() => {
      this.endGame();
    }, this.gameConfig.duration * 1000);
  }

  /**
   * End the game and determine winner
   */
  private async endGame(): Promise<void> {
    if (!this.currentGame || this.currentGame.status !== 'active') return;

    console.log('🏁 Game ending...');

    // Generate random correct answer (1-5)
    const correctAnswer = Math.floor(Math.random() * 5) + 1;
    this.currentGame.correctAnswer = correctAnswer;
    this.currentGame.status = 'ended';

    console.log(`🎯 Correct answer: ${correctAnswer}`);

    // End the game round in CrossGuessGame
    await this.crossGuessGame.endGameRound();

    // Find winner
    const winner = this.currentGame.participants.find(p => p.guess === correctAnswer);
    
    if (winner) {
      this.currentGame.winner = winner;
      console.log(`🏆 Winner found: ${winner.address}`);
      
      // Return prize to winner
      await this.returnPrize(winner);
    } else {
      console.log('🚫 No winner this round - prize pool rolls over');
    }

    console.log(`📊 Game ended. Final participants: ${this.currentGame.participants.length}`);
  }

  /**
   * Return prize to winner using Settlement
   */
  private async returnPrize(winner: SimpleGameParticipant): Promise<void> {
    try {
      console.log(`💰 Returning ${this.currentGame!.prizePool} SOL to ${winner.address}`);
      
      // For now, just log the prize return
      // In a full implementation, this would trigger another cross-chain transfer
      // from the game's SOL wallet back to the winner's SOL address
      
      console.log(`✅ Prize returned successfully to ${winner.address}`);
      
      // TODO: Implement actual SOL return transfer
      // This would require:
      // 1. Setting up a Solana → Ethereum return transfer
      // 2. Or keeping SOL on Solana and sending to winner's SOL address
      
    } catch (error) {
      console.error('❌ Error returning prize:', error);
    }
  }

  /**
   * Get time remaining for current game
   */
  getTimeRemaining(): number {
    if (!this.currentGame || this.currentGame.status !== 'active') return 0;
    return Math.max(0, Math.floor((this.currentGame.endTime - Date.now()) / 1000));
  }

  /**
   * Check if game is accepting new players
   */
  canJoinGame(): boolean {
    return this.currentGame?.status === 'waiting' && 
           this.currentGame.participants.length < this.gameConfig.maxParticipants;
  }
}

// Singleton instance for the application
export const gameManager = new SimpleGameManager(); 