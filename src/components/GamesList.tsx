"use client";

import { getAllGames } from "@/api/gameApi";
import { Game } from "@/types/game";
import { GameSeries } from "@/types/gameSeries";
import { useEffect, useState } from "react";

export default function GamesList() {
  const [games, setGames] = useState<{
    gameSeries: GameSeries[];
    games: Game[];
  }>({ gameSeries: [], games: [] });

  useEffect(() => {
    async function fetchGames() {
      const games = await getAllGames();
      setGames(games);
    }

    fetchGames();
    console.log(games);
  }, []);

  useEffect(() => {
    console.log(games);
  }, [games]);

  return <div>GamesList</div>;
}
