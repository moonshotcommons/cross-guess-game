import React from 'react';

interface WalletConnectProps {
  isConnected: boolean;
  userAddress: string;
  onConnect: (address: string) => void;
  isDemoMode?: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  userAddress,
  onConnect,
  isDemoMode = true
}) => {
  const handleConnect = async () => {
    if (isDemoMode) {
      // Demo: Simulate wallet connection
      const demoAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      onConnect(demoAddress);
    }
    // In real mode, no connection needed as we use private keys
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono">
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          {isDemoMode ? 'Mock Wallet' : 'Private Key Wallet'}
        </div>
      </div>
    );
  }

  // In real mode, if not connected, show configuration hint
  if (!isDemoMode) {
    return (
      <div className="text-sm text-yellow-400">
        Please Configure Private Key
      </div>
    );
  }

  return (
    <button 
      onClick={handleConnect}
      className="btn-primary"
    >
      🔗 Connect Wallets
    </button>
  );
}; 