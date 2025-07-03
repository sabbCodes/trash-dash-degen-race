const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const LOBBY_SIZE = 3; // Max players
const MIN_PLAYERS = 2; // Minimum to start
let lobby = [];
let gameInProgress = false;
let gameState = null;
let startTimeout = null;

function generateTokens(numTokens) {
  return Array.from({ length: numTokens }, (_, i) => ({
    id: (i + 1).toString(),
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 300) + 50,
    value: 1,
    collected: false,
  }));
}

function generateObstacles() {
  // Each obstacle gets a random direction and speed
  function randomVelocity() {
    const angle = Math.random() * 2 * Math.PI;
    const speed = 2 + Math.random() * 2; // 2-4 px per tick
    return { dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed };
  }
  return [
    {
      id: "1",
      type: "toxic-waste",
      x: 200,
      y: 100,
      width: 40,
      height: 40,
      ...randomVelocity(),
    },
    {
      id: "2",
      type: "spinning-trash",
      x: 400,
      y: 200,
      width: 50,
      height: 50,
      ...randomVelocity(),
    },
    {
      id: "3",
      type: "oil-spill",
      x: 300,
      y: 350,
      width: 80,
      height: 30,
      ...randomVelocity(),
    },
  ];
}

function startGameIfReady() {
  if (gameInProgress) return;
  if (lobby.length >= MIN_PLAYERS && lobby.every((p) => p.ready)) {
    gameInProgress = true;
    const numTokens = lobby.length * 5;
    gameState = {
      players: lobby.map((p, i) => ({
        id: p.id,
        x: 50 + i * 50,
        y: 300,
        score: 0,
        stunnedUntil: 0,
      })),
      tokens: generateTokens(numTokens),
      obstacles: generateObstacles(),
      startTime: Date.now(),
    };
    console.log("Emitting gameStart", gameState);
    io.emit("gameStart", gameState);
    if (startTimeout) {
      clearTimeout(startTimeout);
      startTimeout = null;
    }
  }
}

// Add a game tick for obstacle movement and collision
setInterval(() => {
  if (!gameState) return;
  // Move obstacles
  gameState.obstacles.forEach((obs) => {
    obs.x += obs.dx;
    obs.y += obs.dy;
    // Bounce off edges
    if (obs.x < obs.width / 2 || obs.x > 800 - obs.width / 2) obs.dx *= -1;
    if (obs.y < obs.height / 2 || obs.y > 400 - obs.height / 2) obs.dy *= -1;
  });
  // Check collisions for each player
  gameState.players.forEach((player) => {
    // If stunned, skip
    if (player.stunnedUntil && player.stunnedUntil > Date.now()) return;
    for (const obs of gameState.obstacles) {
      // Simple circle-rectangle collision
      const px = player.x,
        py = player.y;
      const rx = obs.x - obs.width / 2,
        ry = obs.y - obs.height / 2;
      const rw = obs.width,
        rh = obs.height;
      const closestX = Math.max(rx, Math.min(px, rx + rw));
      const closestY = Math.max(ry, Math.min(py, ry + rh));
      const dist = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
      if (dist < 20) {
        // collision radius
        // Stun for 2s
        player.stunnedUntil = Date.now() + 2000;
        console.log(
          `Player ${player.id} stunned by obstacle ${obs.type} at (${obs.x},${obs.y})`
        );
        // Knockback 40px away from obstacle center
        const dx = px - obs.x;
        const dy = py - obs.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        player.x = Math.max(0, Math.min(800, px + (dx / len) * 40));
        player.y = Math.max(0, Math.min(400, py + (dy / len) * 40));
        console.log(
          `Player ${player.id} knocked back to (${player.x},${player.y})`
        );
        // If toxic-waste, lose 1 GOR
        if (obs.type === "toxic-waste" && player.score > 0) {
          player.score -= 1;
          console.log(
            `Player ${player.id} lost 1 GOR (score now ${player.score})`
          );
        }
        break;
      }
    }
  });
  io.emit("gameState", gameState);
}, 50);

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Listen for playerReady event
  socket.on("playerReady", () => {
    if (!lobby.find((p) => p.id === socket.id)) {
      lobby.push({ id: socket.id, ready: true });
      io.emit("lobbyUpdate", { count: lobby.length });
    }
    // If lobby is full, start immediately
    if (lobby.length === LOBBY_SIZE && lobby.every((p) => p.ready)) {
      startGameIfReady();
    } else if (lobby.length >= MIN_PLAYERS && lobby.every((p) => p.ready)) {
      // If at least MIN_PLAYERS are ready, start a 5s timer if not already started
      if (!startTimeout) {
        startTimeout = setTimeout(() => {
          startGameIfReady();
        }, 5000);
      }
    }
  });

  // Handle player movement
  socket.on("playerMove", (data) => {
    if (!gameState) return;
    const player = gameState.players.find((p) => p.id === socket.id);
    if (player) {
      if (player.stunnedUntil && player.stunnedUntil > Date.now()) return; // ignore if stunned
      player.x = data.x;
      player.y = data.y;
      io.emit("gameState", gameState);
    }
  });

  // Handle token collection
  socket.on("collectToken", (tokenId) => {
    if (!gameState) return;
    const token = gameState.tokens.find(
      (t) => t.id === tokenId && !t.collected
    );
    const player = gameState.players.find((p) => p.id === socket.id);
    if (token && player) {
      token.collected = true;
      player.score += token.value;
      io.emit("gameState", gameState);
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    lobby = lobby.filter((p) => p.id !== socket.id);
    if (gameState) {
      gameState.players = gameState.players.filter((p) => p.id !== socket.id);
      io.emit("gameState", gameState);
    }
    io.emit("lobbyUpdate", { count: lobby.length });
    if (lobby.length < MIN_PLAYERS && startTimeout) {
      clearTimeout(startTimeout);
      startTimeout = null;
    }
    if (lobby.length === 0) {
      gameInProgress = false;
      gameState = null;
      if (startTimeout) {
        clearTimeout(startTimeout);
        startTimeout = null;
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
