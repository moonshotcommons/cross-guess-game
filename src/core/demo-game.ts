/**
 * Demo Game Manager - For testing without real Settlement transactions
 */

interface DemoGameParticipant {
  address: string;
  guess: number;
  txHash: string;
  timestamp: number;
}

interface DemoGameState {
  id: string;
  status: 'waiting' | 'active' | 'ended';
  startTime: number;
  endTime: number;
  participants: DemoGameParticipant[];
  correctAnswer?: number;
  winner?: DemoGameParticipant;
  prizePool: string;
}

export class DemoGameManager {
  private currentGame: DemoGameState | null = null;
  private gameConfig = {
    duration: 120, // 2 minutes
    entryFee: "0.00001",
    maxParticipants: 5
  };

  /**
   * Join current game or create new one if none exists
   */
  async joinGame(playerAddress: string, guess: number): Promise<{ success: boolean, txHash?: string, gameId?: string }> {
    try {
      console.log(`🎮 DEMO: Player ${playerAddress} attempting to join with guess: ${guess}`);

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

      // Simulate Settlement transaction
      console.log('💰 DEMO: Simulating cross-chain transfer...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const mockTxHash = `demo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add participant to current game
      const participant: DemoGameParticipant = {
        address: playerAddress,
        guess,
        txHash: mockTxHash,
        timestamp: Date.now()
      };

      this.currentGame!.participants.push(participant);
      this.currentGame!.prizePool = (parseFloat(this.currentGame!.prizePool) + parseFloat(this.gameConfig.entryFee)).toString();

      console.log(`✅ DEMO: Player joined successfully. Total participants: ${this.currentGame!.participants.length}`);

      // Start game if this is the first participant
      if (this.currentGame!.participants.length === 1) {
        this.startGame();
      }

      return { 
        success: true, 
        txHash: mockTxHash, 
        gameId: this.currentGame!.id 
      };

    } catch (error) {
      console.error('❌ DEMO: Error joining game:', error);
      return { 
        success: false 
      };
    }
  }

  /**
   * Get current game status
   */
  getGameStatus(): DemoGameState | null {
    return this.currentGame;
  }

  /**
   * Create a new game
   */
  private async createNewGame(): Promise<void> {
    const gameId = `demo_game_${Date.now()}`;
    
    this.currentGame = {
      id: gameId,
      status: 'waiting',
      startTime: 0,
      endTime: 0,
      participants: [],
      prizePool: "0"
    };

    console.log(`🎲 DEMO: New game created: ${gameId}`);
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

    console.log(`🚀 DEMO: Game started! Duration: ${this.gameConfig.duration} seconds`);

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

    console.log('🏁 DEMO: Game ending...');

    // Generate random correct answer (1-5)
    const correctAnswer = Math.floor(Math.random() * 5) + 1;
    this.currentGame.correctAnswer = correctAnswer;
    this.currentGame.status = 'ended';

    console.log(`🎯 DEMO: Correct answer: ${correctAnswer}`);

    // Find winner
    const winner = this.currentGame.participants.find(p => p.guess === correctAnswer);
    
    if (winner) {
      this.currentGame.winner = winner;
      console.log(`🏆 DEMO: Winner found: ${winner.address}`);
      console.log(`💰 DEMO: Prize of ${this.currentGame!.prizePool} SOL goes to ${winner.address}`);
    } else {
      console.log('🚫 DEMO: No winner this round');
    }

    console.log(`📊 DEMO: Game ended. Final participants: ${this.currentGame.participants.length}`);
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

// Singleton instance for demo mode
export const demoGameManager = new DemoGameManager(); 