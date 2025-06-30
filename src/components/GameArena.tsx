
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUp, Coins, Trash } from 'lucide-react';
import type { Player, Obstacle, Token } from '@/types/game';

interface GameArenaProps {
  onGameEnd: (score: number) => void;
  onBackToLobby: () => void;
}

const GameArena: React.FC<GameArenaProps> = ({ onGameEnd, onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player>({
    id: 'local-player',
    name: 'Degen Racer',
    score: 0,
    position: { x: 50, y: 300 },
    isAlive: true,
    gorTokens: 0
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [collectedEffect, setCollectedEffect] = useState<{x: number, y: number} | null>(null);

  const keysPressed = useRef<Set<string>>(new Set());

  // Initialize game objects
  useEffect(() => {
    // Create initial obstacles
    const initialObstacles: Obstacle[] = [
      { id: '1', type: 'toxic-waste', position: { x: 200, y: 100 }, size: { width: 40, height: 40 }, animation: 'float' },
      { id: '2', type: 'spinning-trash', position: { x: 400, y: 200 }, size: { width: 50, height: 50 }, animation: 'spin' },
      { id: '3', type: 'oil-spill', position: { x: 300, y: 350 }, size: { width: 80, height: 30 }, animation: 'pulse' }
    ];
    setObstacles(initialObstacles);

    // Create initial tokens
    const initialTokens: Token[] = [
      { id: '1', position: { x: 150, y: 150 }, value: 10, collected: false, glowEffect: true },
      { id: '2', position: { x: 350, y: 100 }, value: 10, collected: false, glowEffect: true },
      { id: '3', position: { x: 250, y: 250 }, value: 10, collected: false, glowEffect: true },
      { id: '4', position: { x: 450, y: 300 }, value: 10, collected: false, glowEffect: true }
    ];
    setTokens(initialTokens);
  }, []);

  // Game timer
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          onGameEnd(player.gorTokens);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, player.gorTokens, onGameEnd]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Player movement
  useEffect(() => {
    if (!gameActive) return;

    const movePlayer = () => {
      setPlayer(prev => {
        let newX = prev.position.x;
        let newY = prev.position.y;
        const speed = 5;

        if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
          newX = Math.max(0, newX - speed);
        }
        if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
          newX = Math.min(760, newX + speed);
        }
        if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
          newY = Math.max(0, newY - speed);
        }
        if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
          newY = Math.min(360, newY + speed);
        }

        return { ...prev, position: { x: newX, y: newY } };
      });
    };

    const gameLoop = setInterval(movePlayer, 16); // ~60fps
    return () => clearInterval(gameLoop);
  }, [gameActive]);

  // Collision detection
  useEffect(() => {
    // Check token collection
    tokens.forEach(token => {
      if (!token.collected) {
        const distance = Math.sqrt(
          Math.pow(player.position.x - token.position.x, 2) +
          Math.pow(player.position.y - token.position.y, 2)
        );
        
        if (distance < 30) {
          setTokens(prev => prev.map(t => 
            t.id === token.id ? { ...t, collected: true } : t
          ));
          setPlayer(prev => ({ 
            ...prev, 
            gorTokens: prev.gorTokens + token.value,
            score: prev.score + token.value * 10
          }));
          setCollectedEffect({ x: token.position.x, y: token.position.y });
          setTimeout(() => setCollectedEffect(null), 500);
        }
      }
    });

    // Check obstacle collision
    obstacles.forEach(obstacle => {
      const distance = Math.sqrt(
        Math.pow(player.position.x - obstacle.position.x, 2) +
        Math.pow(player.position.y - obstacle.position.y, 2)
      );
      
      if (distance < 40) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);
        // Could add damage/speed reduction here
      }
    });
  }, [player.position, tokens, obstacles]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 800, 400);

    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 400);
      ctx.stroke();
    }
    for (let y = 0; y < 400; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Draw obstacles
    obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.type === 'toxic-waste' ? '#8b00ff' : obstacle.type === 'spinning-trash' ? '#ff6b00' : '#ff0040';
      ctx.fillRect(
        obstacle.position.x - obstacle.size.width / 2,
        obstacle.position.y - obstacle.size.height / 2,
        obstacle.size.width,
        obstacle.size.height
      );
    });

    // Draw tokens
    tokens.forEach(token => {
      if (!token.collected) {
        ctx.fillStyle = '#00ff41';
        ctx.beginPath();
        ctx.arc(token.position.x, token.position.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(token.position.x, token.position.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw player
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.position.x - 10, player.position.y - 10, 20, 20);
    
    // Player glow
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 15;
    ctx.fillRect(player.position.x - 8, player.position.y - 8, 16, 16);
    ctx.shadowBlur = 0;

    // Draw collection effect
    if (collectedEffect) {
      ctx.fillStyle = '#00ff41';
      ctx.font = 'bold 20px Orbitron';
      ctx.fillText('+10 $GOR', collectedEffect.x, collectedEffect.y - 20);
    }
  }, [player, obstacles, tokens, collectedEffect]);

  return (
    <div className={`min-h-screen bg-gray-900 p-4 ${screenShake ? 'screen-shake' : ''}`}>
      {/* Game HUD */}
      <div className="flex justify-between items-center mb-4">
        <Card className="bg-gray-800/90 border-green-400/30 p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold">{player.gorTokens} $GOR</span>
            </div>
            <div className="text-gray-300">
              Score: <span className="text-white font-bold">{player.score}</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800/90 border-orange-400/30 p-3">
          <div className="text-orange-400 font-bold text-xl">
            {timeLeft}s
          </div>
        </Card>

        <Button 
          onClick={onBackToLobby}
          variant="outline"
          className="border-red-400 text-red-400 hover:bg-red-400/20"
        >
          Exit Race
        </Button>
      </div>

      {/* Game Canvas */}
      <div className="flex justify-center">
        <div className="border-2 border-green-400/50 neon-glow bg-gray-900 rounded-lg overflow-hidden">
          <canvas 
            ref={canvasRef}
            width={800}
            height={400}
            className="block"
          />
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden fixed bottom-4 left-4 right-4">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <Button 
            className="aspect-square bg-green-600/80 hover:bg-green-500"
            onTouchStart={() => keysPressed.current.add('ArrowUp')}
            onTouchEnd={() => keysPressed.current.delete('ArrowUp')}
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
          <div></div>
          <Button 
            className="aspect-square bg-green-600/80 hover:bg-green-500"
            onTouchStart={() => keysPressed.current.add('ArrowLeft')}
            onTouchEnd={() => keysPressed.current.delete('ArrowLeft')}
          >
            ←
          </Button>
          <Button 
            className="aspect-square bg-green-600/80 hover:bg-green-500"
            onTouchStart={() => keysPressed.current.add('ArrowDown')}
            onTouchEnd={() => keysPressed.current.delete('ArrowDown')}
          >
            ↓
          </Button>
          <Button 
            className="aspect-square bg-green-600/80 hover:bg-green-500"
            onTouchStart={() => keysPressed.current.add('ArrowRight')}
            onTouchEnd={() => keysPressed.current.delete('ArrowRight')}
          >
            →
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mt-4 text-gray-400 font-mono">
        <p>Use WASD or Arrow Keys to move • Collect $GOR tokens • Avoid toxic waste!</p>
      </div>
    </div>
  );
};

export default GameArena;
