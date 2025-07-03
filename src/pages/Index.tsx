import React, { useState, useEffect } from "react";
import GameLobby from "@/components/GameLobby";
import GameArena from "@/components/GameArena";
import Leaderboard from "@/components/Leaderboard";
import { sendEntryFee } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { useMultiplayer } from "@/hooks/MultiplayerContext";

type GameScreen = "lobby" | "playing" | "leaderboard";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("lobby");
  const [lastScore, setLastScore] = useState(0);
  const [tokenCount, setTokenCount] = useState(5);
  const { wallet, connected } = useWallet();
  const { inGame, sendPlayerReady } = useMultiplayer();
  const [waitingForGame, setWaitingForGame] = useState(false);

  const handleJoinRace = async () => {
    if (!connected || !wallet) return;
    try {
      await sendEntryFee(wallet);
      sendPlayerReady();
      setWaitingForGame(true);
    } catch (e) {
      alert("Failed to send entry fee. Please try again.");
    }
  };

  useEffect(() => {
    if (waitingForGame && inGame) {
      setCurrentScreen("playing");
      setWaitingForGame(false);
    }
  }, [waitingForGame, inGame]);

  const handleGameEnd = (score: number) => {
    setLastScore(score);
    setCurrentScreen("lobby");
  };

  const handleViewLeaderboard = () => {
    setCurrentScreen("leaderboard");
  };

  const handleBackToLobby = () => {
    setCurrentScreen("lobby");
  };

  const renderScreen = () => {
    if (waitingForGame && !inGame) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-2xl text-purple-400">
          Waiting for other players to join...
        </div>
      );
    }
    switch (currentScreen) {
      case "lobby":
        return (
          <GameLobby
            onJoinRace={handleJoinRace}
            onViewLeaderboard={handleViewLeaderboard}
          />
        );
      case "playing":
        return (
          <GameArena
            onGameEnd={handleGameEnd}
            onBackToLobby={handleBackToLobby}
            tokenCount={tokenCount}
          />
        );
      case "leaderboard":
        return <Leaderboard onBackToLobby={handleBackToLobby} />;
      default:
        return (
          <GameLobby
            onJoinRace={handleJoinRace}
            onViewLeaderboard={handleViewLeaderboard}
          />
        );
    }
  };

  return <div className="mobile-optimized">{renderScreen()}</div>;
};

export default Index;
