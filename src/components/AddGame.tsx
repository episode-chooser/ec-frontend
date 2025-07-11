"use client";
import React, { useState, useRef, useEffect } from "react";
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

interface InputItem {
  id: number;
}

const maskTypes = ['": "', '" "', '"pre"', '"i"', '"i: "', '"I"', '"I: "'];

export default function AddGame() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputs, setInputs] = useState<InputItem[]>([]);

  // ref для mainGameName input
  const mainGameNameRef = useRef<HTMLInputElement>(null);

  // refs для inputs - карта id => inputRef
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const [history, setHistory] = useState<InputItem[][]>([]);
  const [redoStack, setRedoStack] = useState<InputItem[][]>([]);
  const [currentMaskType, setCurrentMaskType] = useState(0);

  const nextId = useRef(1);

  const addInput = () => {
    const newInput = { id: nextId.current++ };
    setInputs((prev) => {
      setHistory((h) => [...h, prev]);
      setRedoStack([]);
      return [...prev, newInput];
    });
  };

  const removeInput = (id: number) => {
    setInputs((prev) => {
      setHistory((h) => [...h, prev]);
      setRedoStack([]);
      return prev.filter((input) => input.id !== id);
    });
    inputRefs.current.delete(id);
  };

  const clearFields = () => {
    inputRefs.current.forEach((inputEl) => {
      inputEl.value = "";
    });
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

  const applyMaskToValue = (
    val: string,
    maskType: number,
    index: number,
    mainName: string
  ) => {
    switch (maskType) {
      case 0:
        return `${mainName}: ${val}`;
      case 1:
        return `${mainName} ${val}`;
      case 2:
        return `${val} ${mainName}`;
      case 3:
        return index === 0 ? mainName : `${mainName} ${index + 1}`;
      case 4:
        return index === 0
          ? `${mainName}: ${val}`
          : `${mainName} ${index + 1}: ${val}`;
      case 5:
        return index === 0 ? mainName : `${mainName} ${toRoman(index + 1)}`;
      case 6:
        return index === 0
          ? `${mainName}: ${val}`
          : `${mainName} ${toRoman(index + 1)}: ${val}`;
      default:
        return val;
    }
  };

  const applyMask = (maskType: number) => {
    const mainName = mainGameNameRef.current?.value || "";
    inputs.forEach((input, index) => {
      const inputEl = inputRefs.current.get(input.id);
      if (inputEl) {
        inputEl.value = applyMaskToValue(
          inputEl.value,
          maskType,
          index,
          mainName
        );
      }
    });
  };

  const undoChanges = () => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const lastState = prevHistory[prevHistory.length - 1];
      setRedoStack((prevRedo) => [...prevRedo, inputs]);
      setInputs(lastState);
      return prevHistory.slice(0, prevHistory.length - 1);
    });
  };

  const redoChanges = () => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const nextState = prevRedo[prevRedo.length - 1];
      setHistory((prevHistory) => [...prevHistory, inputs]);
      setInputs(nextState);
      return prevRedo.slice(0, prevRedo.length - 1);
    });
  };

  const handleConfirm = () => {
    const mainName = mainGameNameRef.current?.value || "";
    const results = inputs.map((input) => {
      const val = inputRefs.current.get(input.id)?.value || "";
      return { id: input.id, value: val };
    });
    console.log("Confirmed data:", { mainGameName: mainName, inputs: results });
    cancelConfirm();
  };

  const cancelConfirm = () => {
    setModalVisible(false);
    setInputs([]);
    setHistory([]);
    setRedoStack([]);
    if (mainGameNameRef.current) mainGameNameRef.current.value = "";
    inputRefs.current.forEach((el) => (el.value = ""));
    inputRefs.current.clear();
  };

  const dialogBlure = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => {
        mainGameNameRef.current?.focus();
      }, 100);
    }
  }, [modalVisible]);

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === inputs.length - 1) {
        addInput();
        setTimeout(() => {
          const lastInput = inputs[inputs.length - 1];
          if (lastInput) {
            inputRefs.current.get(lastInput.id)?.focus();
          }
        }, 100);
      } else {
        const nextInput = inputs[index + 1];
        inputRefs.current.get(nextInput.id)?.focus();
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        mainGameNameRef.current?.focus();
      } else {
        const prevInput = inputs[index - 1];
        inputRefs.current.get(prevInput.id)?.focus();
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextInput = inputs[index + 1];
      inputRefs.current.get(nextInput?.id)?.focus();
    }
    if (e.key === "Backspace" || e.key === "Delete") {
      const currentInput = inputs[index];
      const inputEl = inputRefs.current.get(currentInput.id);
      if (inputEl && inputEl.value === "") {
        e.preventDefault();
        removeInput(currentInput.id);
        setTimeout(() => {
          if (index > 0) {
            inputRefs.current.get(inputs[index - 1]?.id)?.focus();
          } else {
            inputRefs.current.get(inputs[0]?.id)?.focus();
          }
        }, 50);
      }
    }
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
            margin="normal"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (inputs.length === 0) {
                  addInput();
                  setTimeout(() => {
                    inputRefs.current.get(inputs[0]?.id)?.focus();
                  }, 100);
                } else {
                  inputRefs.current.get(inputs[0]?.id)?.focus();
                }
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                inputRefs.current.get(inputs[0]?.id)?.focus();
              }
            }}
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
                  inputRef={(el) => {
                    if (el) inputRefs.current.set(input.id, el);
                    else inputRefs.current.delete(input.id);
                  }}
                  fullWidth
                  label={`Game ${index + 1}`}
                  size="small"
                  onKeyDown={(e) => handleInputKeyDown(e, index)}
                />
                <Tooltip title={`Apply mask ${maskTypes[currentMaskType]}`}>
                  <Button
                    sx={{ textTransform: "none" }}
                    variant="outlined"
                    onClick={() => {
                      const inputEl = inputRefs.current.get(input.id);
                      if (inputEl) {
                        inputEl.value = applyMaskToValue(
                          inputEl.value,
                          currentMaskType,
                          index,
                          mainGameNameRef.current?.value || ""
                        );
                      }
                    }}
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
            disabled={!mainGameNameRef.current?.value.trim()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
