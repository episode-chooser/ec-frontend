import { GameSeries } from "./gameSeries";

export type Game = {
  id: number;
  name: string;
  status: string;
  gameSeriesId?: number;
  themeId?: number;
  statsId?: number;
  showcaseId?: number;

  type: "game";
};

export type GameList = (Game | GameSeries)[];
