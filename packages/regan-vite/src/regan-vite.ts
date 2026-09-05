import {Plugin, UserConfig, version} from "vite";

const VITE_MAJOR = Number(version.split(".")[0]);

export const reganVite = () => {
  return {
    name: "vite-plugin-regan",
    enforce: "pre",
    config(_, {mode}) {
      if (VITE_MAJOR >= 8) {
        return {
          oxc: {
            jsx: {
              runtime: "automatic",
              importSource: "regan",
              development: mode === "development",
            },
          },
        } as UserConfig;
      }

      return {
        esbuild: {
          jsx: "automatic",
          jsxDev: mode === "development",
          jsxImportSource: "regan",
          jsxFragment: "Fragment",
          jsxFactory: "createElement",
        },
      };
    },
  } satisfies Plugin;
};