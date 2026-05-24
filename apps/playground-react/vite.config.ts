import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { raurusPlaygroundPlugin } from "./server/plugin";

export default defineConfig({
    plugins: [react(), raurusPlaygroundPlugin()],
});
