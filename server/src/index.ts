import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const port = Number(process.env.PORT ?? "3001");

const app = createApp();

app.listen(port, () => {
  console.log(`[PRMS] Server listening on http://localhost:${port}`);
});
