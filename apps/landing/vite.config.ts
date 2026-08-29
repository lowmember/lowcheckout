import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    // 5173 é do painel (apps/web) — os dois sobem juntos no `turbo dev`.
    port: 4173,
  },
  build: {
    // A landing é conteúdo estático puro: o CSS é o único bundle e o
    // relatório de tamanho não agrega nada ao build.
    reportCompressedSize: false,
  },
});
