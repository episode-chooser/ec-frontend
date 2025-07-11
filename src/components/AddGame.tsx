"use client";
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
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

interface InputHandle {
  getValue: () => string;
  setValue: (val: string) => void;
  focus: () => void;
}

interface InputItem {
  id: number;
}

const maskTypes = ['": "', '" "', '"pre"', '"i"', '"i: "', '"I"', '"I: "'];

// Компонент с локальным состоянием, управляющий своим input
const GameInput = forwardRef<
  InputHandle,
  {
    label: string;
    initialValue: string;
    onRemove: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    maskType: number;
    onApplyMask: (currentVal: string) => string;
  }
>(
  (
    { label, initialValue, onRemove, onKeyDown, maskType, onApplyMask },
    ref
  ) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => value,
        setValue: (val: string) => setValue(val),
        focus: () => inputRef.current?.focus() ?? undefined,
      }),
      [value]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };

    const handleApplyMask = () => {
      setValue(onApplyMask(value));
    };

    return (
      <Box display="flex" alignItems="center" gap={1}>
        <TextField
          inputRef={inputRef}
          fullWidth
          label={label}
          value={value}
          onChange={handleChange}
          size="small"
          onKeyDown={onKeyDown}
        />
        <Tooltip title={`Apply mask ${maskTypes[maskType]}`}>
          <Button
            sx={{ textTransform: "none" }}
            variant="outlined"
            onClick={handleApplyMask}
          >
            {maskTypes[maskType]}
          </Button>
        </Tooltip>
        <Tooltip title="Remove">
          <IconButton size="small" onClick={onRemove}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
);

export default function AddGame() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputs, setInputs] = useState<InputItem[]>([]);
  const [mainGameName, setMainGameName] = useState("");
  const mainGameNameRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<Map<number, React.RefObject<InputHandle>>>(
    new Map()
  );

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
    // создаём реф для нового инпута
    inputRefs.current.set(newInput.id, React.createRef<InputHandle>());
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
    inputRefs.current.forEach((ref) => {
      ref.current?.setValue("");
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

  const applyMaskToValue = (val: string, maskType: number, index: number) => {
    switch (maskType) {
      case 0:
        return `${mainGameName}: ${val}`;
      case 1:
        return `${mainGameName} ${val}`;
      case 2:
        return `${val} ${mainGameName}`;
      case 3:
        return index === 0 ? mainGameName : `${mainGameName} ${index + 1}`;
      case 4:
        return index === 0
          ? `${mainGameName}: ${val}`
          : `${mainGameName} ${index + 1}: ${val}`;
      case 5:
        return index === 0
          ? mainGameName
          : `${mainGameName} ${toRoman(index + 1)}`;
      case 6:
        return index === 0
          ? `${mainGameName}: ${val}`
          : `${mainGameName} ${toRoman(index + 1)}: ${val}`;
      default:
        return val;
    }
  };

  const applyMask = (maskType: number) => {
    inputs.forEach((input, index) => {
      const ref = inputRefs.current.get(input.id);
      if (ref?.current) {
        const newVal = applyMaskToValue(
          ref.current.getValue(),
          maskType,
          index
        );
        ref.current.setValue(newVal);
      }
    });
    setHistory((h) => [...h, inputs]);
    setRedoStack([]);
  };

  const undoChanges = () => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const lastState = prevHistory[prevHistory.length - 1];
      setRedoStack((prevRedo) => [...prevRedo, inputs]);
      setInputs(lastState);

      // Восстановим значения инпутов по истории (сбрасываем значения в компонентах)
      setTimeout(() => {
        lastState.forEach((input, idx) => {
          const ref = inputRefs.current.get(input.id);
          if (ref?.current) {
            // для упрощения, сбрасываем пустую строку — можно сохранить состояние, если понадобится
            ref.current.setValue("");
          }
        });
      }, 10);

      return prevHistory.slice(0, prevHistory.length - 1);
    });
  };

  const redoChanges = () => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const nextState = prevRedo[prevRedo.length - 1];
      setHistory((prevHistory) => [...prevHistory, inputs]);
      setInputs(nextState);

      setTimeout(() => {
        nextState.forEach((input, idx) => {
          const ref = inputRefs.current.get(input.id);
          if (ref?.current) {
            ref.current.setValue("");
          }
        });
      }, 10);

      return prevRedo.slice(0, prevRedo.length - 1);
    });
  };

  const handleConfirm = () => {
    // Получаем значения из всех Input компонентов
    const result = inputs.map((input) => {
      const val = inputRefs.current.get(input.id)?.current?.getValue() ?? "";
      return { id: input.id, value: val };
    });
    console.log("Confirmed data:", { mainGameName, inputs: result });
    cancelConfirm();
  };

  const cancelConfirm = () => {
    setModalVisible(false);
    setInputs([]);
    setMainGameName("");
    setHistory([]);
    setRedoStack([]);
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
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === inputs.length - 1) {
        addInput();
        setTimeout(() => {
          const lastInput = inputs[inputs.length - 1];
          if (lastInput) {
            inputRefs.current.get(lastInput.id)?.current?.focus();
          }
        }, 100);
      } else {
        const nextInput = inputs[index + 1];
        inputRefs.current.get(nextInput.id)?.current?.focus();
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        mainGameNameRef.current?.focus();
      } else {
        const prevInput = inputs[index - 1];
        inputRefs.current.get(prevInput.id)?.current?.focus();
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextInput = inputs[index + 1];
      inputRefs.current.get(nextInput?.id)?.current?.focus();
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
            value={mainGameName}
            onChange={(e) => setMainGameName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (inputs.length === 0) {
                  addInput();
                  setTimeout(() => {
                    if (inputs.length > 0) {
                      inputRefs.current.get(inputs[0].id)?.current?.focus();
                    }
                  }, 100);
                } else {
                  inputRefs.current.get(inputs[0].id)?.current?.focus();
                }
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                inputRefs.current.get(inputs[0]?.id)?.current?.focus();
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
            {inputs.map((input, index) => {
              if (!inputRefs.current.has(input.id)) {
                inputRefs.current.set(input.id, React.createRef<InputHandle>());
              }
              return (
                <GameInput
                  key={input.id}
                  ref={inputRefs.current.get(input.id)!}
                  label={`Game ${index + 1}`}
                  initialValue=""
                  onRemove={() => removeInput(input.id)}
                  onKeyDown={(e) => handleInputKeyDown(e, index)}
                  maskType={currentMaskType}
                  onApplyMask={(val) =>
                    applyMaskToValue(val, currentMaskType, index)
                  }
                />
              );
            })}
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
