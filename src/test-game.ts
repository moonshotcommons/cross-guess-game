/**
 * Simple test script to verify the CrossGuess game functionality
 */

import { gameManager } from './core/simple-game';

async function testGameFlow() {
  console.log('🧪 Starting CrossGuess Game Test');
  console.log('=====================================');

  try {
    // Test 1: Check initial state
    console.log('\n📊 Test 1: Initial game state');
    let status = gameManager.getGameStatus();
    console.log('Initial game status:', status ? status.status : 'null');
    console.log('Can join game:', gameManager.canJoinGame());

    // Test 2: Join game with first player
    console.log('\n🎮 Test 2: First player joins');
    const player1 = '0x1111111111111111111111111111111111111111';
    const result1 = await gameManager.joinGame(player1, 3);
    console.log('Player 1 join result:', result1.success ? '✅ Success' : '❌ Failed');
    
    if (result1.success) {
      console.log('Transaction hash:', result1.txHash);
      console.log('Game ID:', result1.gameId);
    }

    // Test 3: Check game status after first player
    console.log('\n📊 Test 3: Game status after first player');
    status = gameManager.getGameStatus();
    if (status) {
      console.log('Game status:', status.status);
      console.log('Participants:', status.participants.length);
      console.log('Prize pool:', status.prizePool, 'SOL');
      console.log('Time remaining:', gameManager.getTimeRemaining(), 'seconds');
    }

    // Test 4: Add more players (optional - commented out to avoid real transactions)
    console.log('\n⏭️  Test 4: Additional players (skipped in demo)');
    console.log('In a real test, more players would join here...');
    
    // Test 5: Wait for game to end (shortened for demo)
    console.log('\n⏰ Test 5: Waiting for game to complete...');
    console.log('Game will auto-end in 2 minutes (120 seconds)');
    console.log('Monitor the console for game completion...');

    // Set up interval to check game status
    const checkInterval = setInterval(() => {
      const currentStatus = gameManager.getGameStatus();
      if (currentStatus) {
        const timeLeft = gameManager.getTimeRemaining();
        console.log(`⏱️  Time remaining: ${timeLeft}s | Status: ${currentStatus.status} | Players: ${currentStatus.participants.length}`);
        
        if (currentStatus.status === 'ended') {
          console.log('\n🏁 Game ended!');
          console.log('Final result:', {
            correctAnswer: currentStatus.correctAnswer,
            winner: currentStatus.winner ? currentStatus.winner.address : 'No winner',
            participants: currentStatus.participants.length
          });
          clearInterval(checkInterval);
          console.log('\n✅ Test completed successfully!');
        }
      }
    }, 5000); // Check every 5 seconds

    // Clean up after 3 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log('\n🔚 Test timeout - cleaning up');
    }, 180000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testQuickMode() {
  console.log('🚀 Running Quick Test (no real transactions)');
  console.log('============================================');

  // Test the game manager without real Settlement transactions
  const status = gameManager.getGameStatus();
  console.log('Game status:', status);
  console.log('Can join:', gameManager.canJoinGame());
  console.log('Time remaining:', gameManager.getTimeRemaining());

  console.log('\n✅ Quick test completed!');
  console.log('\nTo run full test with real transactions:');
  console.log('1. Make sure your .env file has mainnet private keys');
  console.log('2. Fund the wallets with small amounts');
  console.log('3. Run: npm run test-game');
}

// Determine which test to run based on environment
const isQuickTest = process.env.QUICK_TEST === 'true';

if (isQuickTest) {
  testQuickMode();
} else {
  console.log('⚠️  WARNING: This will use real mainnet funds!');
  console.log('Make sure your .env file is properly configured with small amounts.');
  console.log('To run without real transactions, set QUICK_TEST=true');
  console.log('');
  
  // Add a small delay to let user cancel if needed
  setTimeout(() => {
    testGameFlow();
  }, 3000);
} 