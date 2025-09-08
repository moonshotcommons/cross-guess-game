#!/bin/bash

echo "🎲 Starting CrossGuess - Cross-Chain Prediction Game"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Creating .env from example..."
    cp .env.example .env
    echo "✅ Please edit .env file with your mainnet private keys"
    echo "📝 Required:"
    echo "   MAINNET_ETH_PRIVATE_KEY=your_ethereum_wallet_private_key"
    echo "   MAINNET_SOL_PRIVATE_KEY=your_solana_wallet_private_key"
    echo ""
    echo "⚠️  WARNING: Use REAL mainnet private keys with small amounts!"
    echo "💰 Each game costs ~$0.04 (0.00001 ETH)"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

echo "📦 Installing dependencies..."
npm install

echo "🚀 Starting CrossGuess..."
echo ""
echo "🔧 API Server will start on: http://localhost:3001"
echo "🎮 Frontend will start on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Function to kill all background processes on exit
cleanup() {
    echo ""
    echo "🔚 Stopping CrossGuess..."
    jobs -p | xargs -r kill
    exit 0
}

trap cleanup SIGINT

# Start API server in background
echo "🔧 Starting API server..."
npm run api &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Start frontend in background
echo "🎮 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $API_PID $FRONTEND_PID 