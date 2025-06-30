
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Coins, Trophy, ArrowUp } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/game';

interface LeaderboardProps {
  onBackToLobby: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBackToLobby }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all-time'>('daily');

  // Mock leaderboard data - would come from backend
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, playerName: 'DegenKing420', gorTokens: 2450, racesWon: 23, totalEarnings: 12250 },
    { rank: 2, playerName: 'TrashLord', gorTokens: 2180, racesWon: 19, totalEarnings: 10900 },
    { rank: 3, playerName: 'ToxicRacer', gorTokens: 1950, racesWon: 17, totalEarnings: 9750 },
    { rank: 4, playerName: 'GorGoblin', gorTokens: 1820, racesWon: 15, totalEarnings: 9100 },
    { rank: 5, playerName: 'LandfillLegend', gorTokens: 1650, racesWon: 14, totalEarnings: 8250 },
    { rank: 6, playerName: 'WasteMaster', gorTokens: 1480, racesWon: 12, totalEarnings: 7400 },
    { rank: 7, playerName: 'TrashTitan', gorTokens: 1320, racesWon: 11, totalEarnings: 6600 },
    { rank: 8, playerName: 'GarbageGod', gorTokens: 1180, racesWon: 9, totalEarnings: 5900 },
    { rank: 9, playerName: 'DegenDealer', gorTokens: 1050, racesWon: 8, totalEarnings: 5250 },
    { rank: 10, playerName: 'CryptoTrash', gorTokens: 920, racesWon: 7, totalEarnings: 4600 }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRowGlow = (rank: number) => {
    switch (rank) {
      case 1:
        return 'neon-glow border-yellow-400/50';
      case 2:
        return 'bg-gray-400/10 border-gray-400/30';
      case 3:
        return 'bg-amber-600/10 border-amber-600/30';
      default:
        return 'border-gray-600/30';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 digital-grid">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
          LEADERBOARD
        </h1>
        <p className="text-xl text-gray-300 font-mono">
          Hall of Fame • Digital Landfill Champions
        </p>
      </div>

      {/* Timeframe Filter */}
      <div className="flex justify-center gap-2 mb-8">
        {(['daily', 'weekly', 'all-time'] as const).map((period) => (
          <Button
            key={period}
            onClick={() => setTimeframe(period)}
            variant={timeframe === period ? "default" : "outline"}
            className={timeframe === period 
              ? "bg-green-600 hover:bg-green-700 text-white neon-glow" 
              : "border-green-400/50 text-green-400 hover:bg-green-400/20"
            }
          >
            {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto space-y-3">
        {leaderboardData.map((entry) => (
          <Card key={entry.rank} className={`bg-gray-800/80 ${getRowGlow(entry.rank)} transition-all hover:scale-[1.02]`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getRankIcon(entry.rank)}
                  <div>
                    <h3 className="font-bold text-white text-lg">{entry.playerName}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">Races Won: {entry.racesWon}</span>
                      <Badge variant="outline" className="border-green-400/50 text-green-400">
                        {entry.totalEarnings} $GOR Total
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Coins className="w-6 h-6 text-green-400" />
                    <span className="text-green-400">{entry.gorTokens}</span>
                  </div>
                  <div className="text-sm text-gray-400">$GOR Collected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
        <Card className="bg-gray-800/80 border-green-400/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm">Total Races Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,247</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/80 border-purple-400/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-400 text-sm">$GOR Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">89,420</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/80 border-orange-400/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-400 text-sm">Active Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              432
              <ArrowUp className="w-4 h-4 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="flex justify-center mt-8">
        <Button 
          onClick={onBackToLobby}
          className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white toxic-glow"
        >
          Back to Lobby
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-gray-500 font-mono">
        <p>Rankings update every 30 seconds • #TrashDash #GorbaganaTestnet</p>
      </div>
    </div>
  );
};

export default Leaderboard;
