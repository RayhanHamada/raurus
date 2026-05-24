import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";

const container = document.querySelector("#root");

if (!container) {
    throw new Error("Unable to find docs root element.");
}

createRoot(container).render(
    <StrictMode>
        <App />
    </StrictMode>
);
