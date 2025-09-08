export interface GameRound {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  prizePool: string; // SOL amount
  participants: Participant[];
}

export interface Participant {
  address: string;
  guess: number;
  amount: string; // ETH amount
  transactionHash: string;
  chain: string;
  timestamp: number;
}

export interface GameState {
  currentRound: GameRound | null;
  pastRounds: GameRound[];
  userParticipation: Participant[];
  totalPrizePool: string;
  isLoading: boolean;
  error: string | null;
}

export interface CrossChainSwap {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  amount: string;
  recipient: string;
}

export interface WalletState {
  evmAddress: string | null;
  solanaAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export enum GameType {
  NUMBER_GUESS = "number_guess",
  CRYPTO_PRICE = "crypto_price",
  SPORTS_PREDICTION = "sports_prediction"
}

export interface GameConfig {
  type: GameType;
  duration: number; // in seconds
  entryFee: string; // in ETH
  maxParticipants: number;
  prizeDistribution: number[]; // percentages for winners
} 