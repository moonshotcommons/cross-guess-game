import React from 'react';
import { GameRound } from '../types/game';

interface GameHistoryProps {
  rounds: GameRound[];
}

export const GameHistory: React.FC<GameHistoryProps> = ({ rounds }) => {
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">📊 Game History</h3>
      
      {rounds.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-400">No completed games yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Game results will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.slice(-5).reverse().map((round) => (
            <div key={round.id} className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-semibold">
                  Round #{round.id.slice(-6)}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(round.endTime).toLocaleDateString()}
                </div>
              </div>
              
              <div className="text-sm text-gray-300 mb-2">
                {round.question}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  Winner: <span className="text-green-400">{round.options[round.correctAnswer]}</span>
                </div>
                <div className="text-sm text-purple-400">
                  {round.prizePool} SOL
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {round.participants.length} participants
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 