import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // mode 會是 'development' 或 'production'
  return {
    base: mode === "production" ? "/React-Class3/" : "/",
    plugins: [react()],
  };
});
