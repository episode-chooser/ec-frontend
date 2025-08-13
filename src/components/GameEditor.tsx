"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Game } from "@/types/game";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import TimerIcon from "@mui/icons-material/Timer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import Brightness1Icon from "@mui/icons-material/Brightness1";
import { CheckRounded } from "@mui/icons-material";
import { getPlaylistInfo } from "@/api/youtube";
import { YoutubePlaylistInfo } from "@/types/youtube";

type Status = "none" | "inProgress" | "complete" | "bad" | "wait";

function getStatusIconAndColor(
  status: Status,
  checked: boolean
): { icon: React.ReactNode; color: string } {
  const baseStyle = {
    WebkitTextStrokeWidth: "1px",
    WebkitTextStrokeColor: "#000",
    filter: "drop-shadow(0 0 1px black)",
  };

  switch (status) {
    case "none":
      return {
        icon: checked ? (
          <Brightness1Icon sx={{ ...baseStyle }} />
        ) : (
          <PanoramaFishEyeIcon />
        ),
        color: "#fff",
      };
    case "inProgress":
      return {
        icon: checked ? (
          <SportsEsportsIcon sx={{ ...baseStyle }} />
        ) : (
          <SportsEsportsOutlinedIcon />
        ),
        color: "#0b79d0",
      };
    case "complete":
      return {
        icon: checked ? (
          <CheckCircleIcon sx={{ ...baseStyle }} />
        ) : (
          <CheckRounded />
        ),
        color: "#11c46f",
      };
    case "bad":
      return {
        icon: checked ? (
          <ThumbDownIcon sx={{ ...baseStyle }} />
        ) : (
          <ThumbDownOutlinedIcon />
        ),
        color: "#ee204d",
      };
    case "wait":
      return {
        icon: checked ? (
          <TimerIcon sx={{ ...baseStyle }} />
        ) : (
          <TimerOutlinedIcon />
        ),
        color: "#ebeb63",
      };
    default:
      return { icon: <span />, color: "#000" };
  }
}

const statuses: Status[] = ["complete", "bad", "inProgress", "wait", "none"];

interface GameEditorProps {
  game: Game;
  onSave: (updated: Game) => void;
  onCancel: () => void;
}

export default function GameEditor({
  game,
  onSave,
  onCancel,
}: GameEditorProps) {
  const [name, setName] = useState(game.name);
  const [status, setStatus] = useState(game.status);

  function handleSave() {
    onSave({ ...game, name, status });
  }

  function handleCancel() {
    onCancel();
  }

  // Плейлист, продолжительность и количество серий
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistInfo, setPlaylistInfo] = useState<YoutubePlaylistInfo | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function extractPlaylistId(url: string): string | null {
    try {
      const u = new URL(url);
      return u.searchParams.get("list");
    } catch {
      return null;
    }
  }

  async function handleCalculate() {
    setError(null);
    setPlaylistInfo(null);
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError("Неверная ссылка на плейлист");
      return;
    }
    setLoading(true);
    try {
      const data = await getPlaylistInfo(playlistId);
      setPlaylistInfo(data);
    } catch {
      setError("Ошибка при получении информации о плейлисте");
    } finally {
      setLoading(false);
    }

    console.log(playlistInfo);
  }

  const formatDuration = (sec?: number) => {
    if (!sec && sec !== 0) return "";
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        size="small"
        value={name}
        label="Название игры"
        onChange={(e) => setName(e.target.value)}
      />

      <ToggleButtonGroup
        sx={{ height: 43, width: "100%", display: "flex" }}
        size="small"
        value={status}
        exclusive
        onChange={(event, newStatus) => {
          if (newStatus !== null) {
            setStatus(newStatus);
          }
        }}
      >
        {statuses.map((s) => {
          const { icon, color } = getStatusIconAndColor(s, s === status);
          return (
            <ToggleButton
              key={s}
              value={s}
              aria-label={s}
              sx={{
                flex: 1,
                color: s === status ? "#fff" : color,
                "&.Mui-selected": {
                  bgcolor: color,
                  "&:hover": { bgcolor: color },
                },
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                sx: {
                  color: s === status ? "#fff" : color,
                  fontSize: 28,
                  //   stroke: s === status ? "black" : color,
                  //   strtokeWidth: s === status ? 1 : 0,
                  filter:
                    s === status && (color === "#fff" || color === "#ebeb63")
                      ? "drop-shadow(0 0 1px black)"
                      : "none",
                },
              })}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      <TextField
        label="Ссылка на плейлист YouTube"
        size="small"
        value={playlistUrl}
        onChange={(e) => setPlaylistUrl(e.target.value)}
        fullWidth
        placeholder="https://www.youtube.com/playlist?list=PL..."
      />

      <Button variant="contained" onClick={handleCalculate} disabled={loading}>
        {loading ? "Загрузка..." : "Рассчитать"}
      </Button>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      {playlistInfo && (
        <Box>
          <Typography>Количество видео: {playlistInfo.videoCount}</Typography>
          <Typography>
            Общая продолжительность:{" "}
            {formatDuration(playlistInfo.totalDurationSeconds)}
          </Typography>
        </Box>
      )}

      <Stack direction="row" gap={2}>
        <Button variant="contained" onClick={handleSave} sx={{ flex: 1 }}>
          Сохранить
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleCancel}
          sx={{ flex: 1 }}
        >
          Отмена
        </Button>
      </Stack>
    </Box>
  );
}
