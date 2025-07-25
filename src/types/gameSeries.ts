import { Game } from "./game";

export type PostGameSeriesRequest = {
  name: string;
  gameNames: string[];
};

export type GameSeries = {
  id: number;
  name: string;
  games: Game[];

  type: "series";
};
