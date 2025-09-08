import React, { useState, useEffect } from 'react';
import { GameCard } from './components/GameCard';
import { WalletConnect } from './components/WalletConnect';
import { GameHistory } from './components/GameHistory';
import { PrizePool } from './components/PrizePool';

// API base URL
const API_BASE = 'http://localhost:3001/api';

interface GameStatus {
  success: boolean;
  game: any;
  timeRemaining: number;
  canJoin: boolean;
}

function App() {
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(true); // Auto-connected for demo
  const [userAddress, setUserAddress] = useState<string>('0xDemo...Player');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [canJoinGame, setCanJoinGame] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<string>('Connecting...');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true); // Default to demo mode

  // Poll game status every second
  useEffect(() => {
    const pollGameStatus = async () => {
      try {
        console.log('🔄 Fetching game status from:', `${API_BASE}/game-status?demoMode=${isDemoMode}`);
        const response = await fetch(`${API_BASE}/game-status?demoMode=${isDemoMode}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data: GameStatus = await response.json();
        console.log('📊 Game status response:', data);
        
        if (data.success) {
          setCurrentGame(data.game);
          setTimeRemaining(data.timeRemaining);
          setCanJoinGame(data.canJoin);
          setApiStatus('Connected ✅');
        }
      } catch (error) {
        console.error('❌ Failed to fetch game status:', error);
        console.error('🔧 API Base URL:', API_BASE);
        console.error('🌐 Full URL:', `${API_BASE}/game-status`);
        setApiStatus('Connection Failed ❌');
      }
    };

    // Initial fetch
    pollGameStatus();

    // Poll every second
    const interval = setInterval(pollGameStatus, 1000);

    return () => clearInterval(interval);
  }, [isDemoMode]); // Re-poll when demo mode switches

  const handleWalletConnect = (address: string) => {
    setIsWalletConnected(true);
    setUserAddress(address);
  };

  const handleGameJoin = async (guess: number) => {
    if (isJoining) return;
    
    setIsJoining(true);
    
    try {
      console.log(`🎮 Joining game with guess: ${guess}, Demo mode: ${isDemoMode}`);
      
      // Ensure demoMode is a boolean
      const requestBody: any = { 
        guess, 
        demoMode: Boolean(isDemoMode) 
      };
      
      // In real mode, no need to pass player address, backend will use private key wallet
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`${API_BASE}/join-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Successfully joined game!', result);
        // Update user address to show which mock wallet was used
        setUserAddress(result.playerAddress);
      } else {
        console.error('❌ Failed to join game:', result.error);
        alert(`Failed to join game: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error joining game:', error);
      alert('Error joining game. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Toggle demo mode
  const toggleDemoMode = async () => {
    if (isDemoMode) {
      // Switch to real mode
      setIsDemoMode(false);
      
      // Get private key wallet address
      try {
        const response = await fetch(`${API_BASE}/wallet-info`);
        const data = await response.json();
        
        if (data.hasWallet && data.address) {
          setIsWalletConnected(true);
          setUserAddress(data.address);
        } else {
          setIsWalletConnected(false);
          setUserAddress('');
          alert(data.message);
        }
      } catch (error) {
        console.error('Failed to get wallet info:', error);
        setIsWalletConnected(false);
        setUserAddress('');
      }
    } else {
      // Switch to demo mode
      setIsDemoMode(true);
      setIsWalletConnected(true);
      setUserAddress('0xDemo...Player');
    }
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎲 CrossGuess
            </div>
            <div className="text-sm text-gray-300">
              Cross-Chain Prediction Game
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Demo mode toggle */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">Demo Mode</label>
              <button
                onClick={toggleDemoMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDemoMode ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDemoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <WalletConnect 
              isConnected={isWalletConnected}
              userAddress={userAddress}
              onConnect={handleWalletConnect}
              isDemoMode={isDemoMode}
            />
          </div>
        </div>
      </header>

      {/* Mode indicator */}
      {isDemoMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 py-2 px-4 text-center">
          <p className="text-sm text-yellow-400">
            🎭 Currently in Demo Mode - No real funds required, for testing only
          </p>
        </div>
      )}
      
      {!isDemoMode && (
        <div className="bg-blue-500/10 border border-blue-500/30 py-2 px-4 text-center">
          <p className="text-sm text-blue-400">
            💎 Real Mode - Using real ETH for cross-chain gaming (~$0.05 per game)
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Card */}
          <div className="lg:col-span-2">
            <GameCard 
              game={currentGame}
              isWalletConnected={isWalletConnected}
              onJoinGame={handleGameJoin}
              timeRemaining={timeRemaining}
              canJoin={canJoinGame}
              isJoining={isJoining}
              isDemoMode={isDemoMode}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <PrizePool 
              currentPrize={currentGame?.prizePool || "0"}
              participantCount={currentGame?.participants.length || 0}
            />
            <GameHistory rounds={[]} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p className="mb-2">Powered by Wormhole Settlement & Mayan Swift</p>
          <p className="text-sm">
            🌉 Experience fast cross-chain gaming with Settlement technology
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App; 