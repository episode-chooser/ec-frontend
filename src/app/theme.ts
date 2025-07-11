import { createTheme } from "@mui/material";

const colors = {
  primary: {
    main: "#0b79d0",
  },
  secondary: {
    main: "#11c46f",
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    ...colors,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    ...colors,
  },
});
