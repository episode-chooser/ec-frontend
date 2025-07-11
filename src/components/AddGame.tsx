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
import { Undo } from "@mui/icons-material";

interface Input {
  id: number;
  value: string;
}

const maskTypes = ['": "', '" "', '"pre"', '"i"', '"i: "', '"I"', '"I: "'];

export default function AddGame() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [mainGameName, setMainGameName] = useState<string>("");
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
      return newInputs;
    });
  };

  const removeInput = (id: number) => {
    setInputs((prevInputs) => {
      const newInputs = prevInputs.filter((input) => input.id !== id);
      setHistory((prevHistory) => [...prevHistory, prevInputs]);
      return newInputs;
    });
    inputRefs.current.splice(inputRefs.current.length, 1);
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
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        undoChanges();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history]);

  const handleInputChange = (id: number, newValue: string) => {
    setInputs((prevInputs) => {
      const newInputs = prevInputs.map((input) =>
        input.id === id ? { ...input, value: newValue } : input
      );
      setHistory((prevHistory) => [...prevHistory, prevInputs]);
      return newInputs;
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
  };

  const dialogBlure = () => {
    setModalVisible(false);
  };

  const undoChanges = () => {
    setHistory((prevHistory) => {
      if (prevHistory.length > 0) {
        const lastState = prevHistory[prevHistory.length - 1];
        setInputs(lastState);
        return prevHistory.slice(0, prevHistory.length - 1);
      }
      return prevHistory;
    });
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
          <IconButton edge="end" onClick={cancelConfirm}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label={inputs.length === 0 ? "Game" : "Game series"}
            value={mainGameName}
            onChange={handleMainGameNameChange}
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
          <Button
            variant="outlined"
            onClick={undoChanges}
            disabled={history.length === 0}
          >
            <Undo />
            Undo
          </Button>
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
