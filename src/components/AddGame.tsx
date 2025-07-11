"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { Redo, Undo } from "@mui/icons-material";

interface Input {
  id: number;
  value: string;
}

const maskTypes = ['": "', '" "', '"pre"', '"i"', '"i: "', '"I"', '"I: "'];

export default function AddGame() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [mainGameName, setMainGameName] = useState<string>("");
  const mainGameNameRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<Input[][]>([]);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [currentMaskType, setCurrentMaskType] = useState<number>(0);

  const handleMainGameNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainGameName(e.target.value);
  };

  const addInput = () => {
    setInputs((prevInput) => {
      const newInputs = [...prevInput, { id: Date.now(), value: "" }];
      setHistory((prevHistory) => [...prevHistory, prevInput]);

      setTimeout(() => {
        inputRefs.current[newInputs.length - 1]?.focus();
      }, 100);

      return newInputs;
    });
  };

  const removeInput = (id: number) => {
    setInputs((prevInputs) => {
      const newInputs = prevInputs.filter((input) => input.id !== id);
      setHistory((prevHistory) => [...prevHistory, prevInputs]);
      return newInputs;
    });
    // удаляем ref соответствующего input (чтобы не накапливались)
    inputRefs.current = inputRefs.current.filter(
      (_, i) => inputs[i]?.id !== id
    );
  };

  const clearFields = () => {
    setInputs((prevInputs) =>
      prevInputs.map((input) => ({ ...input, value: "" }))
    );
  };

  function toRoman(num: number) {
    const roman = [
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
    ];
    return roman[num];
  }

  const applyMask = (maskType: number, indexToApply?: number) => {
    setInputs((prevInputs) => {
      const newInputs = prevInputs.map((input, index) => {
        if (indexToApply !== undefined && index !== indexToApply) {
          return input;
        }
        let newValue = input.value;
        switch (maskType) {
          case 0:
            newValue = `${mainGameName}: ${input.value}`;
            break;
          case 1:
            newValue = `${mainGameName} ${input.value}`;
            break;
          case 2:
            newValue = `${input.value} ${mainGameName}`;
            break;
          case 3:
            newValue =
              index === 0 ? mainGameName : `${mainGameName} ${index + 1}`;
            break;
          case 4:
            newValue =
              index === 0
                ? `${mainGameName}: ${input.value}`
                : `${mainGameName} ${index + 1}: ${input.value}`;
            break;
          case 5:
            newValue =
              index === 0
                ? mainGameName
                : `${mainGameName} ${toRoman(index + 1)}`;
            break;
          case 6:
            newValue =
              index === 0
                ? `${mainGameName}: ${input.value}`
                : `${mainGameName} ${toRoman(index + 1)}: ${input.value}`;
            break;
          default:
            break;
        }
        return { ...input, value: newValue };
      });
      setHistory((prevHistory) => [...prevHistory, prevInputs]);
      return newInputs;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Undo Ctrl+Z or Cmd+Z
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        undoChanges();
      }
      // Redo Ctrl+Y or Cmd+Shift+Z
      else if (
        (event.ctrlKey && event.key === "y") ||
        (event.metaKey && event.shiftKey && event.key === "Z")
      ) {
        event.preventDefault();
        redoChanges();
      }
      // Save Ctrl+S or Cmd+S
      else if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, modalVisible, mainGameName, inputs]);

  useEffect(() => {
    if (modalVisible) {
      console.log(mainGameNameRef);
      setTimeout(() => {
        mainGameNameRef.current?.focus();
      }, 100);
    }
  }, [modalVisible]);

  const handleInputChange = (id: number, newValue: string) => {
    setInputs((prevInputs) => {
      const newInputs = prevInputs.map((input) =>
        input.id === id ? { ...input, value: newValue } : input
      );
      setHistory((prevHistory) => [...prevHistory, prevInputs]);
      return newInputs;
    });
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    const currentInput = inputs[index];

    if (e.key === "Enter") {
      e.preventDefault();
      // Если последнее поле - добавляем новое и ставим фокус
      if (index === inputs.length - 1) {
        addInput();
        // Фокус на новый input через небольшой таймаут, чтобы он отрендерился
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 100);
      } else {
        // Иначе переключаем фокус на следующий input
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      // Если поле пустое, удаляем его
      if (currentInput.value === "") {
        e.preventDefault();
        removeInput(currentInput.id);
        // Фокус переключаем на предыдущий или следующий
        setTimeout(() => {
          if (index > 0) {
            inputRefs.current[index - 1]?.focus();
          } else {
            inputRefs.current[0]?.focus();
          }
        }, 50);
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        mainGameNameRef.current?.focus();
      } else {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      // Переключаемся на следующий input
      inputRefs.current[index + 1]?.focus();
    }
  };

  const [redoStack, setRedoStack] = useState<Input[][]>([]);

  const undoChanges = () => {
    setHistory((prevHistory) => {
      if (prevHistory.length > 0) {
        const lastState = prevHistory[prevHistory.length - 1];
        setRedoStack((prevRedo) => [...prevRedo, inputs]);
        setInputs(lastState);
        return prevHistory.slice(0, prevHistory.length - 1);
      }
      return prevHistory;
    });
  };

  const redoChanges = () => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length > 0) {
        const nextState = prevRedo[prevRedo.length - 1];
        setHistory((prevHistory) => [...prevHistory, inputs]);
        setInputs(nextState);
        return prevRedo.slice(0, prevRedo.length - 1);
      }
      return prevRedo;
    });
  };

  const handleConfirm = () => {
    console.log("Confirmed data:", { mainGameName, inputs });
    cancelConfirm();
  };

  const cancelConfirm = () => {
    setModalVisible(false);
    setInputs([]);
    setMainGameName("");
    setHistory([]);
    setRedoStack([]);
  };

  const dialogBlure = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setModalVisible(true)}
        size="medium"
      >
        Add Game
      </Button>
      <Dialog open={modalVisible} onClose={dialogBlure} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Add Game
          <IconButton edge="end" onClick={dialogBlure}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            inputRef={mainGameNameRef}
            fullWidth
            label={inputs.length === 0 ? "Game" : "Game series"}
            value={mainGameName}
            onChange={handleMainGameNameChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (inputs.length === 0) {
                  addInput();
                  setTimeout(() => {
                    inputRefs.current[0]?.focus();
                  }, 100);
                } else {
                  inputRefs.current[0]?.focus();
                }
              }

              if (e.key === "ArrowDown") {
                e.preventDefault();
                inputRefs.current[0]?.focus();
              }
            }}
            margin="normal"
          />

          {inputs.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                Choose mask:
              </Typography>
              <ToggleButtonGroup
                value={currentMaskType}
                exclusive
                onChange={(_, val) => {
                  if (val !== null) setCurrentMaskType(val);
                }}
                aria-label="mask type"
                size="small"
                sx={{ mb: 1 }}
              >
                {maskTypes.map((maskType, index) => (
                  <ToggleButton
                    sx={{ textTransform: "none", fontFamily: "monospace" }}
                    key={index}
                    value={index}
                    aria-label={`mask ${maskType}`}
                  >
                    {maskType}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Stack direction="row" spacing={2} mb={1}>
                <Button
                  variant="contained"
                  onClick={() => applyMask(currentMaskType)}
                >
                  Apply All
                </Button>
                <Button
                  sx={{ color: "white" }}
                  variant="outlined"
                  onClick={clearFields}
                >
                  Clear Fields
                </Button>
              </Stack>
            </Box>
          )}
          <Stack spacing={2}>
            {inputs.map((input, index) => (
              <Box key={input.id} display="flex" alignItems="center" gap={1}>
                <TextField
                  inputRef={(el) => (inputRefs.current[index] = el!)}
                  fullWidth
                  label={`Game ${index + 1}`}
                  value={input.value}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  size="small"
                  onKeyDown={(e) => handleInputKeyDown(e, index)}
                />
                <Tooltip title={`Apply mask ${maskTypes[currentMaskType]}`}>
                  <Button
                    sx={{ textTransform: "none" }}
                    variant="outlined"
                    onClick={() => applyMask(currentMaskType, index)}
                  >
                    {maskTypes[currentMaskType]}
                  </Button>
                </Tooltip>
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    onClick={() => removeInput(input.id)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Stack>
          <Box mt={2} textAlign="center">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addInput}
              size="medium"
            >
              Add Game
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button variant="text" onClick={cancelConfirm}>
            Cancel
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={undoChanges}
              disabled={history.length === 0}
            >
              <Undo />
              Undo
            </Button>
            <Button
              variant="outlined"
              onClick={redoChanges}
              disabled={redoStack.length === 0}
            >
              Redo
              <Redo />
            </Button>
          </Stack>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!mainGameName.trim()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
