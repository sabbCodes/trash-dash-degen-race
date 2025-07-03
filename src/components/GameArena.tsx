import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp, Trash } from "lucide-react";
import type { Player, Obstacle, Token } from "@/types/game";
import { useMultiplayer } from "@/hooks/MultiplayerContext";

interface GameArenaProps {
  onGameEnd: (score: number) => void;
  onBackToLobby: () => void;
  tokenCount: number;
}

const GameArena: React.FC<GameArenaProps> = ({
  onGameEnd,
  onBackToLobby,
  tokenCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player>({
    id: "local-player",
    name: "Degen Racer",
    score: 0,
    position: { x: 50, y: 300 },
    isAlive: true,
    gorTokens: 0,
  });
  const [gameActive, setGameActive] = useState(true);
  const [screenShake, setScreenShake] = useState(false);
  const [collectedEffect, setCollectedEffect] = useState<{
    x: number;
    y: number;
    value: number;
  } | null>(null);

  const keysPressed = useRef<Set<string>>(new Set());
  const { gameState, inGame, sendPlayerMove, collectToken, socketId } =
    useMultiplayer();

  // Preload Gorbagana token image
  const gorImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.src = "/gorbagana.jpg";
    gorImgRef.current = img;
  }, []);

  // Initialize game objects
  useEffect(() => {
    // Create initial obstacles
    const initialObstacles: Obstacle[] = [
      {
        id: "1",
        type: "toxic-waste",
        position: { x: 200, y: 100 },
        size: { width: 40, height: 40 },
        animation: "float",
      },
      {
        id: "2",
        type: "spinning-trash",
        position: { x: 400, y: 200 },
        size: { width: 50, height: 50 },
        animation: "spin",
      },
      {
        id: "3",
        type: "oil-spill",
        position: { x: 300, y: 350 },
        size: { width: 80, height: 30 },
        animation: "pulse",
      },
    ];
  }, []);

  // Game end logic based on derived timeLeft
  useEffect(() => {
    if (!gameActive || !gameState) return;
    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        60 - Math.floor((Date.now() - gameState.startTime) / 1000)
      );
      if (timeLeft <= 0) {
        setGameActive(false);
        onGameEnd(player.gorTokens);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameActive, gameState, onGameEnd, player.gorTokens]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Player movement
  useEffect(() => {
    if (!gameActive) return;

    const movePlayer = () => {
      setPlayer((prev) => {
        let newX = prev.position.x;
        let newY = prev.position.y;
        const speed = 5;

        if (
          keysPressed.current.has("ArrowLeft") ||
          keysPressed.current.has("a")
        ) {
          newX = Math.max(0, newX - speed);
        }
        if (
          keysPressed.current.has("ArrowRight") ||
          keysPressed.current.has("d")
        ) {
          newX = Math.min(760, newX + speed);
        }
        if (
          keysPressed.current.has("ArrowUp") ||
          keysPressed.current.has("w")
        ) {
          newY = Math.max(0, newY - speed);
        }
        if (
          keysPressed.current.has("ArrowDown") ||
          keysPressed.current.has("s")
        ) {
          newY = Math.min(360, newY + speed);
        }

        // Emit movement to server
        sendPlayerMove(newX, newY);
        return { ...prev, position: { x: newX, y: newY } };
      });
    };

    const gameLoop = setInterval(movePlayer, 16); // ~60fps
    return () => clearInterval(gameLoop);
  }, [gameActive, sendPlayerMove]);

  // Collision detection
  useEffect(() => {
    if (!gameState || !gameState.tokens) return;
    // Only check for collisions for the local player
    gameState.tokens.forEach((token) => {
      if (!token.collected) {
        const distance = Math.sqrt(
          Math.pow(player.position.x - token.x, 2) +
            Math.pow(player.position.y - token.y, 2)
        );
        if (distance < 30) {
          // Emit collectToken to server
          collectToken(token.id);
          setCollectedEffect({
            x: token.x,
            y: token.y,
            value: token.value,
          });
        }
      }
    });

    // Check obstacle collision
    if (gameState && gameState.obstacles) {
      gameState.obstacles.forEach((obstacle) => {
        const distance = Math.sqrt(
          Math.pow(player.position.x - obstacle.x, 2) +
            Math.pow(player.position.y - obstacle.y, 2)
        );

        if (distance < 40) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 300);
          // Could add damage/speed reduction here
        }
      });
    }
  }, [player.position, gameState, collectToken]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 800, 400);
    ctx.strokeStyle = "rgba(0, 255, 65, 0.1)";
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
    // Draw obstacles from gameState
    if (gameState && gameState.obstacles) {
      gameState.obstacles.forEach((obstacle) => {
        ctx.fillStyle =
          obstacle.type === "toxic-waste"
            ? "#8b00ff"
            : obstacle.type === "spinning-trash"
            ? "#ff6b00"
            : "#ff0040";
        ctx.fillRect(
          obstacle.x - obstacle.width / 2,
          obstacle.y - obstacle.height / 2,
          obstacle.width,
          obstacle.height
        );
      });
    }
    // Draw tokens from gameState as Gorbagana images
    if (
      gameState &&
      gameState.tokens &&
      gorImgRef.current &&
      gorImgRef.current.complete
    ) {
      gameState.tokens.forEach((token) => {
        if (!token.collected) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(token.x, token.y, 15, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.shadowColor = "#00ff41";
          ctx.shadowBlur = 20;
          ctx.drawImage(gorImgRef.current, token.x - 15, token.y - 15, 30, 30);
          ctx.shadowBlur = 0;
          ctx.restore();
          // Draw green border
          ctx.save();
          ctx.beginPath();
          ctx.arc(token.x, token.y, 15, 0, Math.PI * 2);
          ctx.closePath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#00ff41";
          ctx.stroke();
          ctx.restore();
        }
      });
    }
    // Draw all players from gameState
    if (gameState && gameState.players) {
      gameState.players.forEach((p) => {
        if (p.id === socketId) {
          // If stunned, dim and pulse
          if (p.stunnedUntil && p.stunnedUntil > Date.now()) {
            ctx.save();
            ctx.globalAlpha = 0.4 + 0.2 * Math.sin(Date.now() / 100);
            ctx.fillStyle = "#00ff41";
            ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
            ctx.shadowColor = "#00ff41";
            ctx.shadowBlur = 15;
            ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
            ctx.shadowBlur = 0;
            ctx.restore();
          } else {
            ctx.fillStyle = "#00ff41";
            ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
            ctx.shadowColor = "#00ff41";
            ctx.shadowBlur = 15;
            ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
            ctx.shadowBlur = 0;
          }
          ctx.fillStyle = "#00ff41";
          ctx.font = "bold 14px Orbitron";
          ctx.fillText("You", p.x - 12, p.y - 16);
          // Draw 'Stunned!' badge above avatar if stunned
          if (p.stunnedUntil && p.stunnedUntil > Date.now()) {
            ctx.save();
            ctx.font = "bold 16px Orbitron";
            ctx.fillStyle = "#ff0040";
            ctx.textAlign = "center";
            ctx.fillText("Stunned!", p.x, p.y - 32);
            ctx.restore();
          }
        } else {
          // Opponent: white
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
          ctx.shadowColor = "#00ff41";
          ctx.shadowBlur = 15;
          ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
          ctx.shadowBlur = 0;
        }
      });
    }
    // Draw collection effect (local only)
    if (collectedEffect) {
      ctx.fillStyle = "#00ff41";
      ctx.font = "bold 20px Orbitron";
      ctx.fillText(
        `+${collectedEffect.value} $GOR`,
        collectedEffect.x,
        collectedEffect.y - 20
      );
    }
  }, [gameState, collectedEffect]);

  // Debug log for gameState
  console.log("Multiplayer gameState:", gameState);

  // In the HUD, find the local player and show their score
  const localPlayer =
    gameState && socketId
      ? gameState.players.find((p) => p.id === socketId)
      : null;

  // For the countdown, calculate from gameState.startTime
  const timeLeft = gameState
    ? Math.max(0, 60 - Math.floor((Date.now() - gameState.startTime) / 1000))
    : 0;

  // Helper: is the local player stunned?
  const isStunned =
    localPlayer &&
    localPlayer.stunnedUntil &&
    localPlayer.stunnedUntil > Date.now();

  if (!gameState || !gameState.players || !gameState.tokens) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-2xl text-red-400">
        Waiting for game state from server...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-900 p-4 ${
        screenShake ? "screen-shake" : ""
      }`}
    >
      {/* Game HUD */}
      <div className="flex justify-between items-center mb-4">
        <Card className="bg-gray-800/90 border-green-400/30 p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/gorbagana.jpg"
                alt="$GOR"
                className="w-6 h-6 rounded-full border-2 border-green-400 bg-black"
              />
              <span className="text-green-400 font-bold">
                {localPlayer ? localPlayer.score : 0} $GOR
              </span>
            </div>
            <div className="text-gray-300">
              Score:{" "}
              <span className="text-white font-bold">
                {localPlayer ? localPlayer.score : 0}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800/90 border-orange-400/30 p-3">
          <div className="text-orange-400 font-bold text-xl">{timeLeft}s</div>
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
          <canvas ref={canvasRef} width={800} height={400} className="block" />
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden fixed bottom-4 left-4 right-4">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <Button
            className="aspect-square bg-green-600/80 hover:bg-green-500"
            onTouchStart={() => keysPressed.current.add("ArrowUp")}
            onTouchEnd={() => keysPressed.current.delete("ArrowUp")}
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
          <div></div>
          <Button
            className="aspect-square bg-green-600/80 hover:bg-green-500"
            onTouchStart={() => keysPressed.current.add("ArrowLeft")}
            onTouchEnd={() => keysPressed.current.delete("ArrowLeft")}
          >
            ←
          </Button>
          <Button
            className="aspect-square bg-green-600/80 hover:bg-green-500"
            onTouchStart={() => keysPressed.current.add("ArrowDown")}
            onTouchEnd={() => keysPressed.current.delete("ArrowDown")}
          >
            ↓
          </Button>
          <Button
            className="aspect-square bg-green-600/80 hover:bg-green-500"
            onTouchStart={() => keysPressed.current.add("ArrowRight")}
            onTouchEnd={() => keysPressed.current.delete("ArrowRight")}
          >
            →
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mt-4 text-gray-400 font-mono">
        <p>
          Use WASD or Arrow Keys to move • Collect $GOR tokens • Avoid toxic
          waste!
        </p>
      </div>

      {isStunned && (
        <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-red-900/90 text-white text-3xl font-black px-10 py-6 rounded-2xl border-4 border-red-500 shadow-2xl animate-pulse">
          STUNNED!
        </div>
      )}
    </div>
  );
};

export default GameArena;
