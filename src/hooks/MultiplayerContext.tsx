import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

export interface MultiplayerToken {
  id: string;
  x: number;
  y: number;
  value: number;
  collected: boolean;
}

export interface MultiplayerObstacle {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MultiplayerGameState {
  players: Array<{
    id: string;
    x: number;
    y: number;
    score: number;
    stunnedUntil?: number;
  }>;
  tokens: MultiplayerToken[];
  obstacles: MultiplayerObstacle[];
  startTime: number;
}

interface MultiplayerContextType {
  lobbyCount: number;
  gameState: MultiplayerGameState | null;
  inGame: boolean;
  sendPlayerMove: (x: number, y: number) => void;
  collectToken: (tokenId: string) => void;
  sendPlayerReady: () => void;
  socketId: string | null;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(
  undefined
);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [lobbyCount, setLobbyCount] = useState(1);
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [inGame, setInGame] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Connecting to Socket.IO server at", SERVER_URL);
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    socket.onAny((event, ...args) => {
      console.log("Socket event:", event, args);
    });

    socket.on("lobbyUpdate", (data) => {
      setLobbyCount(data.count);
    });

    socket.on("gameStart", (state) => {
      console.log("Received gameStart", state);
      setGameState(state);
      setInGame(true);
    });

    socket.on("gameState", (state) => {
      setGameState(state);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendPlayerMove = useCallback((x: number, y: number) => {
    socketRef.current?.emit("playerMove", { x, y });
  }, []);

  const collectToken = useCallback((tokenId: string) => {
    socketRef.current?.emit("collectToken", tokenId);
  }, []);

  const sendPlayerReady = useCallback(() => {
    socketRef.current?.emit("playerReady");
  }, []);

  return (
    <MultiplayerContext.Provider
      value={{
        lobbyCount,
        gameState,
        inGame,
        sendPlayerMove,
        collectToken,
        sendPlayerReady,
        socketId,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const ctx = useContext(MultiplayerContext);
  if (!ctx)
    throw new Error("useMultiplayer must be used within a MultiplayerProvider");
  return ctx;
}
