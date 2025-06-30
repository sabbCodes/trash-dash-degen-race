
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash, Coins, Users, Clock } from 'lucide-react';

interface GameLobbyProps {
  onJoinRace: () => void;
  onViewLeaderboard: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onJoinRace, onViewLeaderboard }) => {
  const [playerCount, setPlayerCount] = useState(12);
  const [countdown, setCountdown] = useState(15);
  const [walletConnected, setWalletConnected] = useState(false);
  const [gorBalance, setGorBalance] = useState(420);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 15; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const connectWallet = () => {
    // Placeholder for Backpack wallet integration
    setWalletConnected(true);
    console.log('Connecting to Backpack wallet...');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 digital-grid">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trash className="w-12 h-12 text-green-400 float-animation" />
          <h1 className="text-6xl font-black bg-gradient-to-r from-green-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            TRASH DASH
          </h1>
          <Trash className="w-12 h-12 text-purple-500 float-animation" style={{ animationDelay: '1s' }} />
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
                onClick={connectWallet}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold neon-glow"
              >
                Connect Backpack Wallet
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">$GOR Balance:</span>
                  <span className="text-green-400 font-bold">{gorBalance} $GOR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Entry Fee:</span>
                  <span className="text-orange-400 font-bold">5 $GOR</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Race Info */}
        <Card className="bg-gray-900/80 border-purple-400/30 toxic-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Users className="w-5 h-5" />
              Next Race
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-300">Players:</span>
              <span className="text-purple-400 font-bold">{playerCount}/16</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Starts in:</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-bold text-xl pulse-glow">
                  {countdown}s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button 
          onClick={onJoinRace}
          disabled={!walletConnected}
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
