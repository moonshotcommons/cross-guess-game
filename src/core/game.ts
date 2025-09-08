import {
  Wormhole,
  routes,
} from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";
import {
  MayanRouteSWIFT,
} from '@mayanfinance/wormhole-sdk-route';
import dotenv from "dotenv";
import { getSigner } from "./helpers";
import { GameRound, Participant, GameType, GameConfig } from "../types/game";

dotenv.config();

export class CrossGuessGame {
  private wh: Wormhole<"Mainnet">;
  private resolver: any;
  private gameConfig: GameConfig;
  private currentRound: GameRound | null = null;
  private participants: Map<string, Participant> = new Map();

  constructor(config: GameConfig) {
    this.wh = new Wormhole("Mainnet", [EvmPlatform, SolanaPlatform]);
    // @ts-ignore
    this.resolver = this.wh.resolver([MayanRouteSWIFT]);
    this.gameConfig = config;
  }

  /**
   * Create a new game round
   */
  async createGameRound(question: string, options: string[]): Promise<GameRound> {
    const roundId = `round_${Date.now()}`;
    const startTime = Date.now();
    const endTime = startTime + (this.gameConfig.duration * 1000);

    this.currentRound = {
      id: roundId,
      question,
      options,
      correctAnswer: -1, // Will be set when round ends
      startTime,
      endTime,
      isActive: true,
      prizePool: "0",
      participants: []
    };

    console.log(`🎮 New game round created: ${question}`);
    console.log(`⏰ Duration: ${this.gameConfig.duration} seconds`);
    console.log(`💰 Entry fee: ${this.gameConfig.entryFee} ETH`);

    return this.currentRound;
  }

  /**
   * Join the current game round
   */
  async joinGame(playerAddress: string, guess: number): Promise<string> {
    if (!this.currentRound || !this.currentRound.isActive) {
      throw new Error("No active game round");
    }

    if (Date.now() > this.currentRound.endTime) {
      throw new Error("Game round has ended");
    }

    if (guess < 0 || guess >= this.currentRound.options.length) {
      throw new Error("Invalid guess");
    }

    console.log(`🎯 Player ${playerAddress} joining game with guess: ${guess}`);

    try {
      // Setup chains
      const sendChain = this.wh.getChain("Ethereum");
      const destChain = this.wh.getChain("Solana");

      // Setup tokens
      const source = Wormhole.tokenId(sendChain.chain, "native");
      const destination = Wormhole.tokenId(destChain.chain, "native");
      
      // Get signers
      const sender = await getSigner(sendChain);
      const receiver = await getSigner(destChain);

      // Create transfer request
      const tr = await routes.RouteTransferRequest.create(this.wh, {
        source,
        destination,
      });

      // Find routes
      const foundRoutes = await this.resolver.findRoutes(tr);
      const bestRoute = foundRoutes[0];

      if (!bestRoute) {
        throw new Error("No route found for cross-chain transfer");
      }

      // Setup transfer parameters
      const transferParams = {
        amount: this.gameConfig.entryFee,
        options: bestRoute.getDefaultOptions(),
      };

      // Validate transfer
      const validated = await bestRoute.validate(tr, transferParams);
      if (!validated.valid) {
        throw new Error(`Validation failed: ${validated.error}`);
      }

      // Get quote
      const quote = await bestRoute.quote(tr, validated.params);
      if (!quote.success) {
        throw new Error(`Quote failed: ${quote.error.message}`);
      }

      console.log(`💰 Quote: ${quote.params.amount} ETH → ${quote.destinationAmount} SOL`);

      // Execute cross-chain transfer
      const receipt = await bestRoute.initiate(
        tr,
        sender.signer,
        quote,
        receiver.address
      );

      console.log(`✅ Cross-chain transfer initiated: ${receipt.txid}`);

      // Record participant
      const participant: Participant = {
        address: playerAddress,
        guess,
        amount: this.gameConfig.entryFee,
        transactionHash: receipt.txid,
        chain: "Ethereum",
        timestamp: Date.now()
      };

      this.participants.set(playerAddress, participant);
      this.currentRound.participants.push(participant);

      // Update prize pool
      const currentPool = parseFloat(this.currentRound.prizePool || "0");
      const newAmount = parseFloat(quote.destinationAmount || "0");
      this.currentRound.prizePool = (currentPool + newAmount).toString();

      console.log(`🏆 Prize pool updated: ${this.currentRound.prizePool} SOL`);

      // Wait for transfer completion
      await routes.checkAndCompleteTransfer(
        bestRoute,
        receipt,
        receiver.signer,
        15 * 60 * 1000
      );

      console.log(`🎉 Player ${playerAddress} successfully joined the game!`);
      return receipt.txid;

    } catch (error) {
      console.error("Error joining game:", error);
      throw error;
    }
  }

  /**
   * End the current game round and determine winners
   */
  async endGameRound(): Promise<void> {
    if (!this.currentRound) {
      throw new Error("No active game round");
    }

    console.log(`🏁 Ending game round: ${this.currentRound.id}`);

    // Simple random number generation for now
    // In production, this should use a more secure method
    const correctAnswer = Math.floor(Math.random() * this.currentRound.options.length);
    this.currentRound.correctAnswer = correctAnswer;
    this.currentRound.isActive = false;

    console.log(`🎯 Correct answer: ${correctAnswer} (${this.currentRound.options[correctAnswer]})`);

    // Find winners
    const winners = this.currentRound.participants.filter(p => p.guess === correctAnswer);
    console.log(`🏆 Winners found: ${winners.length}`);

    if (winners.length > 0) {
      await this.distributeRewards(winners);
    } else {
      console.log("🚫 No winners this round - prize pool rolls over");
    }
  }

  /**
   * Distribute rewards to winners
   */
  private async distributeRewards(winners: Participant[]): Promise<void> {
    if (!this.currentRound) return;

    const totalPrize = parseFloat(this.currentRound.prizePool);
    const prizePerWinner = totalPrize / winners.length;

    console.log(`💰 Distributing ${prizePerWinner} SOL to each of ${winners.length} winners`);

    // For now, just log the distribution
    // In a full implementation, this would trigger actual cross-chain transfers
    for (const winner of winners) {
      console.log(`🎉 Sending ${prizePerWinner} SOL to ${winner.address}`);
      // TODO: Implement actual reward distribution
    }
  }

  /**
   * Get current game state
   */
  getCurrentGameState(): GameRound | null {
    return this.currentRound;
  }

  /**
   * Get participant by address
   */
  getParticipant(address: string): Participant | undefined {
    return this.participants.get(address);
  }

  /**
   * Check if game round is active
   */
  isGameActive(): boolean {
    return this.currentRound?.isActive === true && Date.now() < this.currentRound.endTime;
  }
}

// Demo function to run a simple number guessing game
export async function runNumberGuessingDemo(): Promise<void> {
  console.log("🎲 Starting CrossGuess Number Guessing Demo");

  const gameConfig: GameConfig = {
    type: GameType.NUMBER_GUESS,
    duration: 60, // 1 minute for demo
    entryFee: "0.0001",
    maxParticipants: 10,
    prizeDistribution: [100] // Winner takes all
  };

  const game = new CrossGuessGame(gameConfig);

  try {
    // Create a simple number guessing game
    await game.createGameRound(
      "Guess the number between 1-5",
      ["1", "2", "3", "4", "5"]
    );

    console.log("✅ Game created! Players can now join...");
    console.log("ℹ️ In a real application, players would join via the frontend");
    console.log("ℹ️ For demo purposes, the game will auto-end after 60 seconds");

    // Wait for game duration
    setTimeout(async () => {
      await game.endGameRound();
    }, gameConfig.duration * 1000);

  } catch (error) {
    console.error("Demo failed:", error);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  runNumberGuessingDemo();
} 