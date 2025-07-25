import { api } from "./api";
import { Game } from "@/types/game";
import { GameSeries } from "@/types/gameSeries";

export const postGame = async (name: string) => {
  const response = await api.post("/game", { name });
  return response;
};

export const getAllGames = async (): Promise<{
  gameSeries: GameSeries[];
  games: Game[];
}> => {
  const response = await api.get("/game/all");
  return response.data;
};
