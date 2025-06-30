
import React, { useState } from 'react';
import GameLobby from '@/components/GameLobby';
import GameArena from '@/components/GameArena';
import Leaderboard from '@/components/Leaderboard';

type GameScreen = 'lobby' | 'playing' | 'leaderboard';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('lobby');
  const [lastScore, setLastScore] = useState(0);

  const handleJoinRace = () => {
    setCurrentScreen('playing');
  };

  const handleGameEnd = (score: number) => {
    setLastScore(score);
    setCurrentScreen('lobby');
  };

  const handleViewLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleBackToLobby = () => {
    setCurrentScreen('lobby');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'lobby':
        return (
          <GameLobby 
            onJoinRace={handleJoinRace}
            onViewLeaderboard={handleViewLeaderboard}
          />
        );
      case 'playing':
        return (
          <GameArena 
            onGameEnd={handleGameEnd}
            onBackToLobby={handleBackToLobby}
          />
        );
      case 'leaderboard':
        return (
          <Leaderboard 
            onBackToLobby={handleBackToLobby}
          />
        );
      default:
        return (
          <GameLobby 
            onJoinRace={handleJoinRace}
            onViewLeaderboard={handleViewLeaderboard}
          />
        );
    }
  };

  return (
    <div className="mobile-optimized">
      {renderScreen()}
    </div>
  );
};

export default Index;
