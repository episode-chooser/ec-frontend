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
import { GameSeries } from "@/types/gameSeries";

const statuses = [
  { value: "none", label: "Нет" },
  { value: "inProgress", label: "В процессе" },
  { value: "complete", label: "Завершено" },
  { value: "bad", label: "Плохая" },
  { value: "wait", label: "Ожидание" },
];

interface GameSeriesEditorProps {
  series: GameSeries;
  onSave: (updated: GameSeries) => void;
  onCancel: () => void;
}

export default function GameSeriesEditor({
  series,
  onSave,
  onCancel,
}: GameSeriesEditorProps) {
  const [name, setName] = useState(series.name);
  const [status, setStatus] = useState(series.status);

  function handleSave() {
    onSave({ ...series, name, status });
  }

  function handleCancel() {
    onCancel();
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="body2" component="div">
        Название серии
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
