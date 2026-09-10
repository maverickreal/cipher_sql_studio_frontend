import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { router } from "./app/router";
import { store } from "./store";
import { ThemeProvider } from "./theme/ThemeProvider";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(
	<StrictMode>
		<Provider store={store}>
			<ThemeProvider>
				<RouterProvider router={router} />
			</ThemeProvider>
		</Provider>
	</StrictMode>,
);
