"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getGameList } from "@/api/gameApi";
import { Game, GameList } from "@/types/game";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  IconButton,
  Popper,
  Typography,
  Box,
  Collapse,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Skeleton,
  CircularProgress,
  TableHead,
  Fade,
  Grid,
} from "@mui/material";
import {
  PlayArrow,
  FiberManualRecord,
  Close,
  CheckRounded,
} from "@mui/icons-material";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import TimerIcon from "@mui/icons-material/Timer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import Brightness1Icon from "@mui/icons-material/Brightness1";
import { GameSeries } from "@/types/gameSeries";
import GameSeriesEditor from "./GameSeriesEditor";
import GameEditor from "./GameEditor";

type Order = "asc" | "desc" | "default";
type OrderBy = "name" | "duration" | "id" | "episodes";

function formatDuration(sec?: number) {
  if (!sec && sec !== 0) return "";
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

export function getStatusIcon(status: string, checked?: boolean) {
  switch (status) {
    case "none":
      return checked ? (
        <Brightness1Icon sx={{ fontSize: 22 }} />
      ) : (
        <PanoramaFishEyeIcon sx={{ fontSize: 22 }} />
      );
    case "inProgress":
      return checked ? (
        <SportsEsportsIcon sx={{ fontSize: 22, color: "#ebeb63" }} />
      ) : (
        <SportsEsportsOutlinedIcon sx={{ fontSize: 22, color: "#ebeb63" }} />
      );

    case "complete":
      return checked ? (
        <CheckCircleIcon sx={{ fontSize: 22, color: "#11c46f" }} />
      ) : (
        <CheckRounded sx={{ fontSize: 22, color: "#11c46f" }} />
      );
    case "bad":
      return checked ? (
        <ThumbDownIcon sx={{ fontSize: 22, color: "#ee204d" }} />
      ) : (
        <ThumbDownOutlinedIcon sx={{ fontSize: 22, color: "#ee204d" }} />
      );
    case "wait":
      return checked ? (
        <TimerIcon sx={{ fontSize: 22, color: "#ebeb63" }} />
      ) : (
        <TimerOutlinedIcon sx={{ fontSize: 22, color: "#ebeb63" }} />
      );
    default:
      return <span />;
  }
}

export default function GamesList() {
  const [gameList, setGameList] = useState<GameList>([]);
  const [expandedSeries, setExpandedSeries] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextItem, setContextItem] = useState<Game | GameSeries | null>(
    null
  );
  const [orderBy, setOrderBy] = useState<OrderBy>("id");
  const [order, setOrder] = useState<Order>("default");
  const [isLoading, setIsLoading] = useState(true);

  // Для цвета текста в зависимости от статуса игры или серии
  const statusColors: Record<string, string> = {
    none: "white",
    inProgress: "#0b79d0",
    complete: "#11c46f",
    bad: "#ee204d",
    wait: "#ebeb63",
  };

  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true);
      const games = await getGameList();
      setGameList(games);
      setIsLoading(false);
    }
    fetchGames();
  }, []);

  const statusOrder = ["inProgress", "none", "complete", "bad", "wait"];
  const allStatuses = Array.from(
    new Set(
      gameList.flatMap((item) => {
        if (item.type === "game") return [(item as Game).status];
        if (item.type === "series") return [(item as GameSeries).status];
        return [];
      })
    )
  )
    .filter(Boolean)
    .sort((a, b) => {
      const aIndex = statusOrder.indexOf(a);
      const bIndex = statusOrder.indexOf(b);
      return (
        (aIndex === -1 ? Infinity : aIndex) -
        (bIndex === -1 ? Infinity : bIndex)
      );
    });

  const filteredList = gameList
    .map((item) => {
      const filterText = filter.toLowerCase();

      // Общий статус
      let status: string | undefined;
      if (item.type === "game") status = (item as Game).status;
      else if (item.type === "series") status = (item as GameSeries).status;

      const matchesStatus =
        statusFilter.size === 0 || (status && statusFilter.has(status));

      if (item.type === "game") {
        const matchesName = item.name.toLowerCase().includes(filterText);
        return matchesName && matchesStatus ? item : null;
      }

      if (item.type === "series") {
        const series = item as GameSeries;
        const matchesSeriesName = series.name
          .toLowerCase()
          .includes(filterText);

        // Фильтруем вложенные игры
        const filteredGames = series.games.filter(
          (game) =>
            game.name.toLowerCase().includes(filterText) &&
            (statusFilter.size === 0 || statusFilter.has(game.status))
        );

        if ((matchesSeriesName && matchesStatus) || filteredGames.length > 0) {
          return {
            ...series,
            games: filteredGames,
          };
        }
      }

      return null;
    })
    .filter(Boolean) as (Game | GameSeries)[];

  function getDuration(item: Game | GameSeries): number | undefined {
    if (item.type === "game") {
      return (item as any).durationSeconds;
    }
    return undefined;
  }

  const sortedList = useMemo(() => {
    const sortFn = (a, b) => {
      switch (orderBy) {
        case "id":
          return order === "asc" ? a.id - b.id : b.id - a.id;

        case "name": {
          const valA = String(a.name ?? "").toLowerCase();
          const valB = String(b.name ?? "").toLowerCase();
          if (valA < valB) return order === "asc" ? -1 : 1;
          if (valA > valB) return order === "asc" ? 1 : -1;
          return 0;
        }

        default:
          return 0; // для будущих полей можно добавить новые case
      }
    };

    return [...filteredList]
      .map((item) => ({
        ...item,
        games: Array.isArray(item.games)
          ? [...item.games].sort(sortFn)
          : item.games, // оставляем как есть, если нет массива
      }))
      .sort(sortFn);
  }, [filteredList, orderBy, order]);

  function toggleSeries(id: number) {
    setExpandedSeries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  function handleRowClick(item: Game | GameSeries) {
    if (item.type === "series") toggleSeries(item.id);
  }

  function handleContextMenu(
    event: React.MouseEvent<HTMLElement>,
    item: Game | GameSeries
  ) {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setContextItem(item);
  }

  function handleClosePopper() {
    setTimeout(() => {
      setContextItem(null);
    }, 500);
    setAnchorEl(null);
  }

  function handleStatusChange(status: string, checked: boolean) {
    setStatusFilter((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(status);
      else newSet.delete(status);
      return newSet;
    });
  }

  function handleSort(property: OrderBy) {
    if (orderBy !== property) {
      setOrderBy(property);
      setOrder("asc");
    } else {
      if (order === "default") setOrder("asc");
      else if (order === "asc") setOrder("desc");
      else {
        setOrder("default");
        setOrderBy("id");
      }
    }
  }

  const cellPadding = "0px 0px";

  return (
    <>
      <Box mb={1} display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Фильтр по названию"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ width: 250, minWidth: 150 }}
        />
        <FormGroup row>
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  variant="circular"
                  width={32}
                  height={32}
                  sx={{ marginRight: 2 }}
                />
              ))
            : allStatuses.map((status) => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      size="small"
                      checked={statusFilter.has(status)}
                      onChange={(e) =>
                        handleStatusChange(status, e.target.checked)
                      }
                      icon={getStatusIcon(status)}
                      checkedIcon={getStatusIcon(
                        status,
                        statusFilter.has(status)
                      )}
                      sx={{
                        color: statusColors[status],
                        "&.Mui-checked": {
                          color: statusColors[status],
                        },
                      }}
                    />
                  }
                  label={""}
                />
              ))}
        </FormGroup>
      </Box>
      <TableContainer
        sx={{
          maxWidth: "max-content",
          width: "auto",
          overflow: "hidden",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 200,
            width: "auto",
            tableLayout: "auto",
            borderCollapse: "collapse",
            border: "none",
            fontSize: 16,
            "& td, & th": {
              border: "none",
              fontSize: 16,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  p: "0px 8px",
                  width: 36,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              />
              <TableCell
                onClick={() => handleSort("name")}
                sx={{
                  p: "0px 8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Название{" "}
                {orderBy === "name" ? (order === "asc" ? "▲" : "▼") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("episodes")}
                sx={{
                  p: "0px 8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                # {"    "}
                {orderBy === "episodes" ? (order === "asc" ? "▲" : "▼") : ""}
              </TableCell>
              <TableCell
                onClick={() => handleSort("duration")}
                sx={{
                  // p: "0px 8px",
                  p: 0,
                  fontWeight: "bold",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                xx:xx:xx{" "}
                {orderBy === "duration" ? (order === "asc" ? "▲" : "▼") : ""}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? [...Array(10)].map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`}>
                    <TableCell sx={{ p: cellPadding }}>
                      <Skeleton variant="circular" width={14} height={14} />
                    </TableCell>
                    <TableCell sx={{ p: cellPadding }}>
                      <Skeleton variant="text" width={180} />
                    </TableCell>
                    <TableCell sx={{ p: cellPadding }}>
                      <Skeleton variant="text" width={40} />
                    </TableCell>
                    <TableCell sx={{ p: cellPadding }}>
                      <Skeleton variant="text" width={70} />
                    </TableCell>
                  </TableRow>
                ))
              : sortedList.map((item) => {
                  if (item.type === "series") {
                    const isExpanded = expandedSeries.has(item.id);
                    const series = item as GameSeries;
                    return (
                      <React.Fragment key={`series-${item.id}`}>
                        <TableRow
                          onClick={() => handleRowClick(item)}
                          onContextMenu={(e) => handleContextMenu(e, item)}
                          sx={{
                            backgroundColor: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <TableCell
                            sx={{
                              width: 32,
                              p: cellPadding,
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                width: "22.88px",
                                height: "22.88px",
                                top: "0px",
                                left: "7px",
                                position: "absolute",
                              }}
                            >
                              <PlayArrow
                                sx={{
                                  color: statusColors[series.status],
                                  transition: "0.3s",
                                  transform: isExpanded
                                    ? "rotate(90deg)"
                                    : "rotate(0deg)",
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              p: cellPadding,
                              color: statusColors[series.status] || "inherit",
                            }}
                          >
                            <Box display="flex" alignItems="center" gap="3px">
                              <span>{series.name}</span>
                              {series.status !== "none" &&
                                getStatusIcon(series.status)}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ p: cellPadding }} />
                          <TableCell sx={{ p: cellPadding }} />
                        </TableRow>
                        <TableRow>
                          <TableCell
                            style={{
                              paddingBottom: 0,
                              paddingTop: 0,
                              paddingRight: 0,
                            }}
                            colSpan={4}
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ ml: 2 }}>
                                <Grid container direction="column">
                                  {series.games.map((game) => (
                                    <Grid
                                      container
                                      key={`game-${game.id}`}
                                      onContextMenu={(e) =>
                                        handleContextMenu(e, game)
                                      }
                                      sx={{
                                        cursor: "context-menu",
                                        alignItems: "center",
                                      }}
                                    >
                                      {/* Индикатор статуса */}
                                      <Grid
                                        item
                                        sx={{ width: 16, p: cellPadding }}
                                      >
                                        <FiberManualRecord
                                          sx={{
                                            fontSize: 10,
                                            color: statusColors[game.status],
                                          }}
                                        />
                                      </Grid>

                                      {/* Название + иконка статуса */}
                                      <Grid
                                        item
                                        sx={{
                                          p: cellPadding,
                                          color:
                                            statusColors[game.status] ||
                                            "inherit",
                                          flex: 1,
                                        }}
                                      >
                                        <Box
                                          display="flex"
                                          alignItems="center"
                                          gap="3px"
                                        >
                                          <span>{game.name}</span>
                                          {game.status !== "none" &&
                                            getStatusIcon(game.status)}
                                        </Box>
                                      </Grid>

                                      {/* Пустое место (как было пустая ячейка) */}
                                      <Grid
                                        item
                                        sx={{ p: cellPadding, width: 20 }}
                                      />

                                      {/* Длительность */}
                                      <Grid item sx={{ p: cellPadding }}>
                                        {formatDuration(game.stats?.duration)}
                                      </Grid>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  } else {
                    const game = item as Game;
                    return (
                      <TableRow
                        key={`game-${game.id}`}
                        onContextMenu={(e) => handleContextMenu(e, game)}
                        sx={{ cursor: "context-menu" }}
                      >
                        <TableCell
                          sx={{
                            width: 32,
                            p: cellPadding,
                            textAlign: "center",
                          }}
                        >
                          <FiberManualRecord
                            sx={{
                              fontSize: 10,
                              color: statusColors[game.status],
                              marginLeft: "6px",
                            }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            p: cellPadding,
                            color: statusColors[game.status] || "inherit",
                          }}
                        >
                          <Box display="flex" alignItems="center" gap="3px">
                            <span>{game.name}</span>
                            {game.status !== "none" &&
                              getStatusIcon(game.status)}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ p: cellPadding }} />
                        <TableCell
                          sx={{
                            p: cellPadding,
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          {formatDuration(game.stats?.duration)}
                        </TableCell>
                      </TableRow>
                    );
                  }
                })}
          </TableBody>
        </Table>
      </TableContainer>
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        sx={{
          zIndex: 1300,
          ml: "36px !important",
          maxWidth: 250,
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box bgcolor={"#222"} sx={{ borderRadius: 2, boxShadow: 3, p: 1 }}>
              {contextItem && (
                <Box minWidth={150}>
                  {contextItem?.type === "series" ? (
                    <GameSeriesEditor
                      series={contextItem as GameSeries}
                      onSave={(updated) => {
                        console.log("Сохраняем серию:", updated);
                        handleClosePopper();
                      }}
                      onCancel={handleClosePopper}
                    />
                  ) : (
                    <GameEditor
                      game={contextItem as Game}
                      onSave={(updated) => {
                        console.log("Сохраняем игру:", updated);
                        handleClosePopper();
                      }}
                      onCancel={handleClosePopper}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  );
}
