import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash, Coins, Users, Clock } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useMultiplayer } from "@/hooks/MultiplayerContext";

interface GameLobbyProps {
  onJoinRace: () => void;
  onViewLeaderboard: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({
  onJoinRace,
  onViewLeaderboard,
}) => {
  const {
    connect,
    disconnect,
    connected: walletConnected,
    balance: gorBalance,
    publicKey,
    wallet,
  } = useWallet();
  const { lobbyCount } = useMultiplayer();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 digital-grid">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trash className="w-12 h-12 text-green-400 float-animation" />
          <h1 className="text-6xl font-black bg-gradient-to-r from-green-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            TRASH DASH
          </h1>
          <Trash
            className="w-12 h-12 text-purple-500 float-animation"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <p className="text-xl text-green-300 font-mono">
          Race • Collect • Dominate the Digital Landfill
        </p>
        <Badge className="mt-2 neon-glow bg-green-900/50 text-green-300 border-green-400">
          #GorbaganaTestnet
        </Badge>
      </div>

      {/* Main Game Area */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl w-full">
        {/* Wallet & Balance */}
        <Card className="bg-gray-900/80 border-green-400/30 neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Coins className="w-5 h-5" />
              Wallet Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!walletConnected ? (
              <Button
                onClick={connect}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold neon-glow"
              >
                Connect Backpack Wallet
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">$GOR Balance:</span>
                  <span className="text-green-400 font-bold">
                    {gorBalance !== null && gorBalance !== undefined
                      ? gorBalance
                      : 0}{" "}
                    $GOR
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Entry Fee:</span>
                  <span className="text-orange-400 font-bold">5 $GOR</span>
                </div>
                {publicKey && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-300">Connected:</span>
                    <span className="text-xs text-purple-300 font-mono bg-gray-800 px-2 py-1 rounded">
                      {publicKey.toBase58().slice(0, 4)}...
                      {publicKey.toBase58().slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lobby Status */}
        <Card className="bg-gray-900/80 border-purple-400/30 toxic-glow animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Users className="w-5 h-5 animate-bounce" />
              Lobby Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Players in Lobby:</span>
              <span className="text-purple-400 font-bold text-xl">
                {lobbyCount}/3
              </span>
            </div>
            <div className="mt-4 text-center text-green-300 font-mono text-lg">
              <span role="img" aria-label="trash">
                🗑️
              </span>{" "}
              Waiting for more degens to join the digital landfill...
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          onClick={onJoinRace}
          disabled={!walletConnected || (gorBalance !== null && gorBalance < 5)}
          className="px-8 py-6 text-xl font-black bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black neon-glow transform hover:scale-105 transition-all"
        >
          JOIN RACE
        </Button>
        <Button
          onClick={onViewLeaderboard}
          variant="outline"
          className="px-8 py-6 text-xl font-bold border-purple-400 text-purple-400 hover:bg-purple-400/20 toxic-glow"
        >
          LEADERBOARD
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 font-mono">
        <p>Powered by Gorbagana • Built for Degens • Made with 🗑️</p>
      </div>
    </div>
  );
};

export default GameLobby;
