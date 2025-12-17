# Azure Web App Deployment Guide

This guide provides the necessary configuration to deploy your application to an Azure Web App. It supports both standard file synchronization and **Zip Deploy** (recommended for performance).

## 1. Environment Variables

Add the following environment variables to your Azure Web App's "Configuration" -> "Application settings" section.

```dotenv
# Azure Web App Configuration
AZURE_WEBAPP_NAME="<YOUR_AZURE_WEBAPP_NAME_HERE>"
AZURE_WEBAPP_PACKAGE_PATH="."
NODE_VERSION="20.x"

# Recommended: Run from Package (Zip Deploy)
# This mounts the zip file directly as read-only, improving start-up time and atomicity.
WEBSITE_RUN_FROM_PACKAGE="1"

# Database Connection
# You DO NOT need an intermediate VM. Just point these to your existing MySQL server.
DB_HOST="<YOUR_MYSQL_SERVER_HOST>"  # e.g., my-server.mysql.database.azure.com
DB_USER="<YOUR_DB_USER>"
DB_PASSWORD="<YOUR_DB_PASSWORD>"
DB_NAME="db_unesco"                 # As defined in your code
DB_PORT="3306"                      # Usually 3306 for external MySQL
```

## 2. GitHub Secrets

To enable GitHub Actions verify and deploy to Azure, you need to set up the deployment credentials.

1.  Go to your Azure Web App in the Azure Portal.
2.  Click on **"Get publish profile"** in the Overview tab to download the file.
3.  Open the file and copy its entire content.
4.  Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
5.  Click **New repository secret**.
6.  Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
7.  Value: Paste the content of the publish profile.
8.  Click **Add secret**.

## 3. GitHub Actions Workflow

Create a new file at `.github/workflows/azure-deploy.yml` and copy the following content into it:

```yaml
name: Build and Deploy to Azure Web App

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: "<YOUR_AZURE_WEBAPP_NAME_HERE>" # set this to your application's name
  AZURE_WEBAPP_PACKAGE_PATH: "." # set this to the path to your web app project, defaults to the repository root
  NODE_VERSION: "20.x" # set this to the node version to use

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: "./package-lock.json"

      - name: npm install, build, and test
        run: |
          npm install
          npm run build --if-present
          npm run test --if-present

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: .

  deploy:
    permissions:
      contents: none
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: "Development"
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: "Deploy to Azure Web App"
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}
```

> Make sure to replace `<YOUR_AZURE_WEBAPP_NAME_HERE>` in the YAML file as well if you prefer hardcoding it there, or just rely on the GitHub Repository Variable/Secret strategies.

## 4. Manual Zip Deploy (Optional)

If you prefer to deploy manually without GitHub Actions, you can use the Azure CLI.

1.  **Prepare the Content**:

    - **Root Folder**: You are already in the root folder (where `package.json` is).
    - Run `npm install` to ensure all production dependencies are present.
    - _Important_: For "Run From Package", you **MUST** include `node_modules` in your zip file.

2.  **Create the Zip**:

    - Select all files in the **repository root** (including `node_modules`, `src`, `package.json`, etc.).
    - Zip them together.
    - **Crucial**: `package.json` must be at the root of the zip.

3.  **Deploy**:

    - Run the command below:

    ```bash
    az webapp deployment source config-zip --resource-group <YOUR_RESOURCE_GROUP> --name <YOUR_APP_NAME> --src <PATH_TO_YOUR_ZIP_FILE>
    ```

    - **Do I need to delete anything?** No. If you use `WEBSITE_RUN_FROM_PACKAGE="1"`, the new zip file completely replaces the previous version instantly.

> [!TIP] > **Run From Package**: If you set `WEBSITE_RUN_FROM_PACKAGE="1"` in your Azure settings, the app will run directly from the zip file you uploaded. This is cleaner and faster.

## 5. Connectivity & Firewall

**Do I need an extra VM?**
No. Your Azure Web App connects directly to the MySQL server.

**However, check these settings:**

1.  **If using Azure Database for MySQL**:
    - Go to "Connection security" in the MySQL blade.
    - Enable **"Allow access to Azure services"**. This allows your Web App to connect without knowing its dynamic IP.
2.  **If using a MySQL on a VM or External Provider**:
    - You must allow the **Outbound IP Addresses** of your Azure Web App in the firewall of your MySQL server.
    - You can find these IPs in your Web App under **Networking** -> **Outbound Traffic**.
