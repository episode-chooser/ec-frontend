import { GameSeries } from "@/types/gameSeries";
import { api } from "./api";
import { Game, GameList } from "@/types/game";

export const postGame = async (name: string) => {
  const response = await api.post("/game", { name });
  return response;
};

export const getGameList = async (): Promise<GameList> => {
  const response = await api.get("/game/all");
  const data: { gameSeries: GameSeries[]; games: Game[] } = response.data;

  const seriesMap = Object.fromEntries(
    data.gameSeries.map((s) => [s.id, { ...s, used: false }])
  );
  const gameList: GameList = [];

  data.games.forEach((game) => {
    if (game.gameSeriesId) {
      const series = seriesMap[game.gameSeriesId];
      if (!series.used) {
        series.used = true;
        const { used, ...seriesToPush } = series;
        gameList.push({ ...seriesToPush, type: "series", id: game.id });
      }
    } else {
      gameList.push({ ...game, type: "game" });
    }
  });

  return gameList;
};
