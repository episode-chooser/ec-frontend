"use client";

import { getGameList } from "@/api/gameApi";
import { GameList } from "@/types/game";
import { useEffect, useState } from "react";

export default function GamesList() {
  const [gameList, setGameList] = useState<GameList>([]);

  useEffect(() => {
    async function fetchGames() {
      const games = await getGameList();
      setGameList(games);
    }

    fetchGames();
  }, []);

  useEffect(() => {
    console.log(gameList);
  }, [gameList]);

  return <div>GamesList</div>;
}
