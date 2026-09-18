import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/lib/news/**/*.test.ts",
      "src/lib/news/__tests__/**/*.ts",
      "src/lib/news-intake/**/*.test.ts",
      "src/lib/visitors/**/*.test.ts",
      "src/features/website-factory/**/*.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
});
