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
  Paper,
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
import { PlayArrow, FiberManualRecord, Close } from "@mui/icons-material";
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

  useEffect(() => {
    async function fetchGames() {
      const games = await getGameList();
      setGameList(games);
    }
    fetchGames();
  }, []);

  // Собираем все уникальные статусы из игр и серий для фильтра чекбоксов
  const allStatuses = Array.from(
    new Set(
      gameList.flatMap((item) =>
        item.type === "game" ? [(item as Game).status] : []
      )
    )
  ).filter(Boolean);

  // Фильтр по названию + статусу
  const filteredList = gameList.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(filter.toLowerCase());
    const status = item.type === "game" ? (item as Game).status : undefined;
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

  // Минимальные отступы и ширина таблицы по контенту
  const cellPadding = "0px 0px";

  return (
    <>
      <Box mb={1} display="flex" alignItems="center" gap={2} flexWrap="wrap">
        {/* Фильтры */}
        <TextField
          size="small"
          placeholder="Фильтр по названию"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ width: 250, minWidth: 150 }}
        />
        <FormGroup row>
          {allStatuses.map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  size="small"
                  checked={statusFilter.has(status)}
                  onChange={(e) => handleStatusChange(status, e.target.checked)}
                />
              }
              label={status}
            />
          ))}
        </FormGroup>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ maxWidth: "max-content", width: "auto" }}
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
                      <TableCell sx={{ p: cellPadding }}>
                        {series.name}
                      </TableCell>
                      <TableCell sx={{ p: cellPadding }}>
                        {/* пусто - количество серий */}
                      </TableCell>
                      <TableCell sx={{ p: cellPadding }}>
                        {/* пусто - продолжительность */}
                      </TableCell>
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
                                    sx={{
                                      cursor: "context-menu",
                                    }}
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
                                    <TableCell sx={{ p: cellPadding }}>
                                      {game.name}
                                    </TableCell>
                                    <TableCell sx={{ p: cellPadding }}>
                                      {/* пусто */}
                                    </TableCell>
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
                    sx={{
                      cursor: "context-menu",
                    }}
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
                    <TableCell sx={{ p: cellPadding }}>{game.name}</TableCell>
                    <TableCell sx={{ p: cellPadding }}>{/* пусто */}</TableCell>
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
