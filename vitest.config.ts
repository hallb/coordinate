import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    exclude: ["node_modules", "dist", "e2e/**"],
    resolve: {
      alias: {
        "@/domain": path.resolve(__dirname, "src/domain"),
        "@/application": path.resolve(__dirname, "src/application"),
        "@/adapters": path.resolve(__dirname, "src/adapters"),
      },
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
