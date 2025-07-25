"use client";

import { getGameList } from "@/api/gameApi";
import { Game, GameList } from "@/types/game";
import { GameSeries } from "@/types/gameSeries";
import { useEffect, useState } from "react";

function GameItem(game: Game) {
  return <div>GameItem: {game.name}</div>;
}

function GameSeriesItem(gameSeries: GameSeries) {
  return <div>GameSeriesItem: {gameSeries.name}</div>;
}

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

  return (
    <div>
      {gameList.map((item) =>
        item.type === "game" ? GameItem(item) : GameSeriesItem(item)
      )}
    </div>
  );
}
