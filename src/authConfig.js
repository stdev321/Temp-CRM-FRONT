import { LogLevel } from "@azure/msal-browser";

const clientId = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
const authority = process.env.REACT_APP_MICROSOFT_AUTHORITY;
const redirectUri = process.env.REACT_APP_MICROSOFT_REDIRECT_URI;

export const msalConfig = {
  auth: {
    clientId: clientId ?? "",
    authority: authority ?? "",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: [process.env.REACT_APP_MICROSOFT_SCOPE ?? ""],
};
