import React from 'react';

interface PrizePoolProps {
  currentPrize: string;
  participantCount: number;
}

export const PrizePool: React.FC<PrizePoolProps> = ({
  currentPrize,
  participantCount
}) => {
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-center">🏆 Prize Pool</h3>
      
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-yellow-400 mb-2">
          {parseFloat(currentPrize).toFixed(4)} SOL
        </div>
        <div className="text-sm text-gray-400">
          ≈ ${(parseFloat(currentPrize) * 120).toFixed(2)} USD
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Participants:</span>
          <span className="font-semibold">{participantCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Network:</span>
          <div className="flex items-center space-x-1">
            <span>Ethereum</span>
            <span className="text-purple-400">→</span>
            <span>Solana</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">Settlement:</span>
          <span className="text-green-400">Mayan Swift</span>
        </div>
      </div>

      <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <div className="text-sm text-center text-gray-300">
          <p className="font-semibold mb-1">⚡ How Settlement Works</p>
          <p>Instant cross-chain transfers powered by competitive solvers</p>
        </div>
      </div>
    </div>
  );
}; 