import { GameSeries } from "./gameSeries";
import { Stats } from "./stats";

export type Game = {
  id: number;
  name: string;
  status: string;
  gameSeriesId?: number;
  themeId?: number;
  stats?: Stats | null;
  showcaseId?: number;

  type: "game";
};

export type GameList = (Game | GameSeries)[];
