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
  value: string;
}

const maskTypes = [': "', '" "', '"pre"', '"i"', '"i: "', '"I"', '"I: "'];

function InputItemComponent({
  id,
  initialValue,
  onValueChange,
  inputRef,
  label,
  onRemove,
  onKeyDown,
  index,
  currentMaskType,
  mainGameName,
}: {
  id: number;
  initialValue: string;
  onValueChange: (id: number, val: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
  label: string;
  onRemove: (id: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, index: number) => void;
  index: number;
  currentMaskType: number;
  mainGameName: string;
}) {
  const [value, setValue] = React.useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    onValueChange(id, value);
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

  const handleApplyMaskClick = () => {
    const newVal = applyMaskToValue(
      value,
      currentMaskType,
      index,
      mainGameName
    );
    setValue(newVal);
    onValueChange(id, newVal);
  };

  return (
    <>
      <TextField
        inputRef={inputRef}
        fullWidth
        label={label}
        size="small"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={(e) => onKeyDown(e, index)}
      />
      <Tooltip title={`Apply mask ${maskTypes[currentMaskType]}`}>
        <Button
          sx={{ textTransform: "none", ml: 1, whiteSpace: "nowrap" }}
          variant="outlined"
          onClick={handleApplyMaskClick}
        >
          {maskTypes[currentMaskType]}
        </Button>
      </Tooltip>
      <Tooltip title="Remove">
        <IconButton size="small" onClick={() => onRemove(id)}>
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

function MainGameNameInput({
  initialValue,
  onValueChange,
  inputRef,
  onKeyDown,
  label,
}: {
  initialValue: string;
  onValueChange: (val: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  label: string;
}) {
  const [value, setValue] = React.useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    onValueChange(value);
  };

  return (
    <TextField
      inputRef={inputRef}
      fullWidth
      label={label}
      margin="normal"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
    />
  );
}

export default function AddGame() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputs, setInputs] = useState<InputItem[]>([]);
  const [history, setHistory] = useState<InputItem[][]>([]);
  const [redoStack, setRedoStack] = useState<InputItem[][]>([]);
  const [currentMaskType, setCurrentMaskType] = useState(0);
  const [mainGameName, setMainGameName] = useState("");
  const mainGameNameRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const nextId = useRef(1);

  const pushToHistory = (newInputs: InputItem[]) => {
    setHistory((h) => [...h, newInputs]);
    setRedoStack([]);
  };

  const addInput = () => {
    const newInput = { id: nextId.current++, value: "" };
    setInputs((prev) => {
      pushToHistory(prev);
      const newInputs = [...prev, newInput];
      setTimeout(() => {
        inputRefs.current.get(newInput.id)?.focus();
      }, 50);
      return newInputs;
    });
  };

  const removeInput = (id: number) => {
    setInputs((prev) => {
      pushToHistory(prev);
      inputRefs.current.delete(id);
      return prev.filter((input) => input.id !== id);
    });
  };

  const handleValueChange = (id: number, val: string) => {
    setInputs((prev) =>
      prev.map((input) => (input.id === id ? { ...input, value: val } : input))
    );
  };

  const handleMainGameNameChange = (val: string) => {
    setMainGameName(val);
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
    const mainName = mainGameName;
    setInputs((prev) => {
      pushToHistory(prev);
      return prev.map((input, index) => ({
        ...input,
        value: applyMaskToValue(input.value, maskType, index, mainName),
      }));
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

  // Новый метод очистки данных — вызывается при cancel и confirm
  const resetAll = () => {
    setMainGameName("");
    setInputs([]);
    setHistory([]);
    setRedoStack([]);
    nextId.current = 1;
    inputRefs.current.clear();
  };

  const dialogBlur = () => {
    setModalVisible(false);
    resetAll();
  };

  const handleConfirm = () => {
    console.log("Confirmed data:", { mainGameName, inputs });
    setModalVisible(false);
    resetAll();
  };

  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => {
        mainGameNameRef.current?.focus();
      }, 100);
    }
  }, [modalVisible]);

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === inputs.length - 1) {
        addInput();
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
      <Dialog open={modalVisible} onClose={dialogBlur} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Add Game
          <IconButton edge="end" onClick={dialogBlur}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <MainGameNameInput
            inputRef={mainGameNameRef}
            initialValue={mainGameName}
            onValueChange={handleMainGameNameChange}
            label={inputs.length === 0 ? "Game" : "Game series"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (inputs.length === 0) {
                  addInput();
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
                Choose mask:{" "}
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
                  onClick={() =>
                    setInputs((prev) =>
                      prev.map((input) => ({ ...input, value: "" }))
                    )
                  }
                >
                  Clear Fields
                </Button>
              </Stack>
            </Box>
          )}

          <Stack spacing={2}>
            {inputs.map((input, index) => (
              <Box
                key={input.id}
                display="flex"
                alignItems="center"
                gap={1}
                flexWrap="nowrap"
              >
                <InputItemComponent
                  id={input.id}
                  initialValue={input.value}
                  onValueChange={handleValueChange}
                  inputRef={(el) => {
                    if (el) inputRefs.current.set(input.id, el);
                    else inputRefs.current.delete(input.id);
                  }}
                  label={`Game ${index + 1}`}
                  onRemove={removeInput}
                  onKeyDown={handleInputKeyDown}
                  index={index}
                  currentMaskType={currentMaskType}
                  mainGameName={mainGameName}
                />
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
          <Button variant="text" onClick={dialogBlur}>
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
            disabled={mainGameName.trim() === ""}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
