import { PostGameSeriesRequest } from "@/types/gameSeries";
import { api } from "./api";

export const postGameSeries = async (data: PostGameSeriesRequest) => {
  const response = await api.post("/game-series", data);
  return response;
};
