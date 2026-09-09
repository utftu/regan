import {Plugin, UserConfig} from "vite";

export const reganVite = () => {
  return {
    name: "vite-plugin-regan",
    enforce: "pre",
    config(_, {mode}) {
      return {
        oxc: {
          jsx: {
            runtime: "automatic",
            importSource: "regan",
            development: mode === "development",
          },
        },
      } as UserConfig;
    },
  } satisfies Plugin;
};