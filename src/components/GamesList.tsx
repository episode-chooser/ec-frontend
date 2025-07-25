"use client";
import React, { useEffect, useState } from "react";
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
import { GameSeries } from "@/types/gameSeries";

type Order = "asc" | "desc";

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

function getStatusIcon(status: string, checked?: boolean) {
  switch (status) {
    case "none":
      return <span />;
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
  const [orderBy, setOrderBy] = useState<"name" | "duration">("name");
  const [order, setOrder] = useState<Order>("asc");

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
      const games = await getGameList();
      setGameList(games);
    }
    fetchGames();
  }, []);

  const allStatuses = Array.from(
    new Set(
      gameList.flatMap((item) => {
        if (item.type === "game") return [(item as Game).status];
        if (item.type === "series") return [(item as GameSeries).status];
        return [];
      })
    )
  ).filter(Boolean);

  const filteredList = gameList.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(filter.toLowerCase());
    let status: string | undefined = undefined;
    if (item.type === "game") status = (item as Game).status;
    else if (item.type === "series") status = (item as GameSeries).status;
    const matchesStatus =
      statusFilter.size === 0 || (status && statusFilter.has(status));
    return matchesName && matchesStatus;
  });

  function getDuration(item: Game | GameSeries): number | undefined {
    if (item.type === "game") {
      return (item as any).durationSeconds;
    }
    return undefined;
  }

  const sortedList = [...filteredList].sort((a, b) => {
    if (orderBy === "name") {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName < bName) return order === "asc" ? -1 : 1;
      if (aName > bName) return order === "asc" ? 1 : -1;
      return 0;
    } else {
      const aDur = getDuration(a) ?? -1;
      const bDur = getDuration(b) ?? -1;
      if (aDur === -1 && bDur !== -1) return 1;
      if (bDur === -1 && aDur !== -1) return -1;
      if (aDur < bDur) return order === "asc" ? -1 : 1;
      if (aDur > bDur) return order === "asc" ? 1 : -1;
      return 0;
    }
  });

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
    setAnchorEl(null);
    setContextItem(null);
  }

  function handleStatusChange(status: string, checked: boolean) {
    setStatusFilter((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(status);
      else newSet.delete(status);
      return newSet;
    });
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
          {allStatuses.map(
            (status) =>
              status !== "none" && (
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
              )
          )}
        </FormGroup>
      </Box>
      <TableContainer
        sx={{
          maxWidth: "max-content",
          width: "auto",
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
          <TableBody>
            {sortedList.map((item) => {
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
                          {getStatusIcon(series.status)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ p: cellPadding }} />
                      <TableCell sx={{ p: cellPadding }} />
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={4}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ marginLeft: 2 }}>
                            <Table
                              size="small"
                              aria-label="games in series"
                              sx={{
                                width: "max-content",
                                borderCollapse: "collapse",
                                border: "none",
                                fontSize: 16,
                                "& td, & th": {
                                  border: "none",
                                  fontSize: 16,
                                },
                              }}
                            >
                              <TableBody>
                                {series.games.map((game) => (
                                  <TableRow
                                    key={`game-${game.id}`}
                                    onContextMenu={(e) =>
                                      handleContextMenu(e, game)
                                    }
                                    sx={{ cursor: "context-menu" }}
                                  >
                                    <TableCell
                                      sx={{
                                        width: 16,
                                        p: cellPadding,
                                      }}
                                    >
                                      <FiberManualRecord
                                        sx={{
                                          fontSize: 10,
                                          color: "text.secondary",
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        p: cellPadding,
                                        color:
                                          statusColors[game.status] ||
                                          "inherit",
                                      }}
                                    >
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap="3px"
                                      >
                                        <span>{game.name}</span>
                                        {getStatusIcon(game.status)}
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{ p: cellPadding }} />
                                    <TableCell sx={{ p: cellPadding }}>
                                      {formatDuration(
                                        (game as any).durationSeconds
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
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
                          color: "text.secondary",
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
                        {getStatusIcon(game.status)}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ p: cellPadding }} />
                    <TableCell sx={{ p: cellPadding }}>
                      {formatDuration((game as any).durationSeconds)}
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
        sx={{
          zIndex: 1300,
          p: 1,
          border: "1px solid",
          bgcolor: "background.paper",
          boxShadow: 3,
          maxWidth: 250,
        }}
      >
        <Box p={1} minWidth={150}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="body1" fontWeight="bold">
              {contextItem?.type === "series"
                ? "Редактировать серию"
                : "Редактировать игру"}
            </Typography>
            <IconButton size="small" onClick={handleClosePopper}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            (Заглушка - сюда будет форма редактирования)
          </Typography>
        </Box>
      </Popper>
    </>
  );
}
