import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { GlobalProvider } from "./Context/GlobalContext";
import store from "./store";
import initRequest from "./services/initRequest";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import { MsalProvider } from "@azure/msal-react";

initRequest(store);

const msalInstance = new PublicClientApplication(msalConfig);
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <GlobalProvider>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </GlobalProvider>
  </Provider>
);

reportWebVitals();
