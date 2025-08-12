"use client";
import { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Game } from "@/types/game";

const statuses = [
  { value: "none", label: "Нет" },
  { value: "inProgress", label: "В процессе" },
  { value: "complete", label: "Завершено" },
  { value: "bad", label: "Плохая" },
  { value: "wait", label: "Ожидание" },
];

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

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body2" component="div">
        Название
      </Typography>
      <TextField
        size="small"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Typography variant="body2" component="div">
        Статус
      </Typography>
      <Select
        size="small"
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
      >
        {statuses.map((s) => (
          <MenuItem key={s.value} value={s.value}>
            {s.label}
          </MenuItem>
        ))}
      </Select>

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
