import { YoutubePlaylistInfo } from "@/types/youtube";
import { api } from "./api";

export const getPlaylistInfo = async (
  playlistId: string
): Promise<YoutubePlaylistInfo> => {
  const response = await api.get(
    `/youtube/playlist-info?playlistId=${playlistId}`
  );
  return response.data;
};
