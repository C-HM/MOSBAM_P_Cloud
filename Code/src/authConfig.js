/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { configDotenv } from "dotenv";

configDotenv();

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of request and response data types, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
export const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID || "ENTER_CLIENT_ID", // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: process.env.CLOUD_INSTANCE + process.env.TENANT_ID, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
    clientSecret: process.env.CLIENT_SECRET || "ENTER_CLIENT_SECRET", // Client secret generated from the app registration in Azure portal
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 3,
    },
  },
};

export const REDIRECT_URI =
  process.env.REDIRECT_URI || "http://localhost:3003/auth/redirect";
export const POST_LOGOUT_REDIRECT_URI =
  process.env.POST_LOGOUT_REDIRECT_URI || "http://localhost:3003";
export const GRAPH_ME_ENDPOINT = process.env.GRAPH_API_ENDPOINT + "v1.0/me";
