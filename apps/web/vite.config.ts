import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    /**
     * Proxy de desenvolvimento para a API.
     *
     * Em produção o CORS é resolvido pelo próprio API Gateway (bloco `httpApi.cors`
     * do serverless.ts), mas o `serverless-offline` não emula isso: a preflight
     * `OPTIONS` volta 204 **sem nenhum header de CORS**, e o navegador bloqueia
     * toda chamada que carrega `x-account-id` ou `Authorization`. Servir a API sob
     * o mesmo origin em dev elimina a preflight em vez de contorná-la.
     */
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
        /**
         * Descarta o `Cookie` antes de encaminhar para a API.
         *
         * Servir a API sob a mesma origin faz o navegador anexar os cookies de
         * `localhost` a toda chamada — inclusive o `g_state={"i_l":0}` que o
         * Google Identity Services grava durante o login. O `serverless-offline`
         * roda sobre Hapi, que valida o header `Cookie` com `strictHeader` e
         * recusa esse JSON com `400 Invalid cookie value`, antes de chegar em
         * qualquer handler. A API se autentica por `Authorization`/`x-account-id`
         * e não lê cookie nenhum, então removê-los aqui só apaga o falso
         * positivo do Hapi — em produção o API Gateway não faz essa validação.
         */
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyRequest) => {
            proxyRequest.removeHeader("cookie");
          });
        },
      },
    },
  },
});
