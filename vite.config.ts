/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import Icons from "unplugin-icons/vite";

// https://vitejs.dev/config/
export default ({ mode }) => {
  console.log("mode", mode);
  const env = loadEnv(mode, process.cwd());
  console.log("env", env);
  return defineConfig({
    server: {
      hmr: true,
    },
    plugins: [
      vue(),
      legacy(),
      Icons({ compiler: "vue3" }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
  });
};
