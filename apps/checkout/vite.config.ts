import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    /*
     * A página do comprador é a superfície que converte, em rede móvel. Um
     * chunk único evita o segundo round-trip que o code splitting cobraria
     * antes de qualquer pixel aparecer — o app tem uma tela só, não há rota
     * para adiar.
     */
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 5273,
    /**
     * Mesmo proxy do painel, pela mesma razão: o `serverless-offline` responde
     * a preflight `OPTIONS` sem header nenhum de CORS, e servir a API sob o
     * mesmo origin em dev elimina a preflight em vez de contorná-la. Em
     * produção quem resolve o CORS é o `httpApi.cors` do serverless.ts — e a
     * origem deste app precisa estar em `CORS_ORIGINS`.
     */
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyRequest) => {
            proxyRequest.removeHeader("cookie");
          });
        },
      },
    },
  },
});
