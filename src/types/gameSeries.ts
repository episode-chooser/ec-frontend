import { Game } from "./game";

export type PostGameSeriesRequest = {
  name: string;
  gameNames: string[];
};

export type GameSeries = {
  id: number;
  name: string;
  status: string;
  games: Game[];

  type: "series";
};
