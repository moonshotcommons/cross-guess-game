import React, { useState } from 'react';

interface GameCardProps {
  game: any;
  isWalletConnected: boolean;
  onJoinGame: (guess: number) => void;
  timeRemaining: number;
  canJoin: boolean;
  isJoining: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  isWalletConnected, 
  onJoinGame, 
  timeRemaining,
  canJoin,
  isJoining
}) => {
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleGuessSubmit = () => {
    if (selectedGuess === null) return;
    
    onJoinGame(selectedGuess);
  };

  // Create default game options if game doesn't exist
  const gameOptions = ['1', '2', '3', '4', '5'];
  const gameQuestion = game ? "What number will I pick between 1-5?" : "Loading game...";

  if (!game) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎲</div>
          <h2 className="text-2xl font-bold mb-4">No Active Game</h2>
          <p className="text-gray-300 mb-4">Ready to start a new round?</p>
          <p className="text-sm text-gray-400">
            Click "Join Game" below to start the next round!
          </p>
        </div>
        
        {/* Show game options even when no game */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Make Your Prediction</h3>
          <div className="grid grid-cols-5 gap-3">
            {['1', '2', '3', '4', '5'].map((option, index) => (
              <button
                key={index}
                onClick={() => !isJoining && setSelectedGuess(index + 1)}
                disabled={isJoining}
                className={`game-option ${
                  selectedGuess === (index + 1) ? 'selected' : ''
                } ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-2xl font-bold">{option}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="border-t border-white/10 pt-6">
          <div className="text-center">
            <button
              onClick={handleGuessSubmit}
              disabled={selectedGuess === null || isJoining}
              className={`btn-primary ${
                selectedGuess === null || isJoining ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isJoining ? 'Starting Game...' :
               selectedGuess !== null ? 
                `Start New Game with "${selectedGuess}"` : 
                'Select Your Guess First'
              }
            </button>
            <div className="mt-4 text-sm text-gray-400">
              <p>💡 How it works:</p>
                              <p>1. Pay 0.00001 ETH on Ethereum chain (~$0.04)</p>
              <p>2. Your payment gets converted to SOL via Mayan Settlement</p>
              <p>3. Winners receive SOL rewards on Solana</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isGameEnded = game.status === 'ended';
  const isGameActive = game.status === 'active';
  const isGameWaiting = game.status === 'waiting';

  // Check if current player has already joined
  const currentPlayerAddress = '0xDemo...Player'; // This would come from wallet in real app
  const hasPlayerJoined = game.participants?.some((p: any) => p.address === currentPlayerAddress);

  return (
    <div className="card">
      {/* Game Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{gameQuestion}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <span>Entry Fee: 0.00001 ETH</span>
              <span>•</span>
              <span>Participants: {game.participants?.length || 0}</span>
              <span>•</span>
              <span>Status: {game.status || 'waiting'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-purple-400">
              {isGameEnded ? "⏰ ENDED" : 
               isGameActive ? `⏰ ${formatTime(timeRemaining)}` : 
               "🕐 WAITING"}
            </div>
            <div className="text-sm text-gray-400">
              {isGameEnded ? "Game Over" : 
               isGameActive ? "Time Remaining" : 
               "Waiting for players"}
            </div>
          </div>
        </div>
      </div>

      {/* Game Options */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Make Your Prediction</h3>
        <div className="grid grid-cols-5 gap-3">
          {gameOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => !hasPlayerJoined && !isGameEnded && !isJoining && canJoin && setSelectedGuess(index + 1)}
              disabled={hasPlayerJoined || isGameEnded || isJoining || !canJoin}
              className={`game-option ${
                selectedGuess === (index + 1) ? 'selected' : ''
              } ${(hasPlayerJoined || isGameEnded || isJoining || !canJoin) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-2xl font-bold">{option}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Game Result Display */}
      {isGameEnded && game.correctAnswer && (
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">🎯 Game Result</h3>
            <p className="text-purple-400 text-xl font-bold mb-2">
              Correct Answer: {game.correctAnswer}
            </p>
            {game.winner ? (
              <p className="text-green-400">
                🏆 Winner: {game.winner.address.slice(0, 6)}...{game.winner.address.slice(-4)}
              </p>
            ) : (
              <p className="text-gray-400">🚫 No winner this round</p>
            )}
          </div>
        </div>
      )}

      {/* Action Section */}
      <div className="border-t border-white/10 pt-6">
        {!isWalletConnected ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">Connect your wallet to join the game</p>
            <div className="text-sm text-gray-400">
              You'll need both Ethereum (ETH) and Solana (SOL) wallets
            </div>
          </div>
        ) : hasPlayerJoined ? (
          <div className="text-center">
            <div className="text-green-400 text-lg font-semibold mb-2">
              ✅ You're in the game!
            </div>
            <p className="text-gray-300">
              Your guess: <span className="font-semibold">{
                game.participants?.find((p: any) => p.address === currentPlayerAddress)?.guess || 'Loading...'
              }</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {isGameActive ? 'Game is running...' : 'Waiting for results...'}
            </p>
          </div>
        ) : isGameEnded ? (
          <div className="text-center">
            <p className="text-gray-400 text-lg">This round has ended</p>
            <p className="text-sm text-gray-500 mt-2">New game will start automatically</p>
          </div>
        ) : !canJoin ? (
          <div className="text-center">
            <p className="text-yellow-400 text-lg">Game is full or already started</p>
            <p className="text-sm text-gray-400 mt-2">Wait for the next round</p>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={handleGuessSubmit}
              disabled={selectedGuess === null || isJoining}
              className={`btn-primary ${
                selectedGuess === null || isJoining ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isJoining ? 'Joining Game...' :
               selectedGuess !== null ? 
                `Join Game with "${selectedGuess}"` : 
                'Select Your Guess First'
              }
            </button>
            <div className="mt-4 text-sm text-gray-400">
              <p>💡 How it works:</p>
                                <p>1. Pay 0.00001 ETH on Ethereum chain (~$0.04)</p>
              <p>2. Your payment gets converted to SOL via Mayan Settlement</p>
              <p>3. Winners receive SOL rewards on Solana</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 