import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";

export const palettes = {
  light: {
    background: "#F8F7FA",
    surface: "#FFFFFF",
    ink: "#24202D",
    muted: "#6B6476",
    line: "#E8E3EC",
    tint: "#694D98",
    wash: "#F0EBF7",
    hero: "#4B356D",
    onHero: "#FFFFFF",
    heroMuted: "#DDD1ED",
    danger: "#AB3030",
  },
  dark: {
    background: "#17141D",
    surface: "#24202D",
    ink: "#F5F1FA",
    muted: "#B4ABBE",
    line: "#393140",
    tint: "#C8A9F5",
    wash: "#33283F",
    hero: "#4B356D",
    onHero: "#FFFFFF",
    heroMuted: "#DDD1ED",
    danger: "#FFA7A7",
  },
};

type Appearance = "system" | "light" | "dark";
type ThemeState = {
  colors: typeof palettes.light;
  dark: boolean;
  appearance: Appearance;
  setAppearance: (value: Appearance) => void;
};
const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [appearance, setAppearance] = useState<Appearance>("system");
  const dark =
    appearance === "dark" || (appearance === "system" && system === "dark");
  return (
    <ThemeContext.Provider
      value={{
        colors: dark ? palettes.dark : palettes.light,
        dark,
        appearance,
        setAppearance,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeState {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("ThemeProvider is missing.");
  return theme;
}
