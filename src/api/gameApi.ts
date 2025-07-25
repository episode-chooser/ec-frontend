import { api } from "./api";

export const postGame = async (name: string) => {
  const response = await api.post("/game", { name });
  return response;
};
