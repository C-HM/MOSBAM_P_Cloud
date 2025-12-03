# MOSBAM_P_Cloud

# Azure Deployment Guide (Separate Services)

This guide outlines the steps to deploy your Vue.js frontend to **Azure Static Web Apps** and your Node.js backend to **Azure App Service**.

## Prerequisites

- An active Azure account.
- This project pushed to a GitHub repository.

---

## Step 1: Database Setup (Azure Database for MySQL)

1.  **Create Resource**: In the Azure Portal, create a new resource and search for **"Azure Database for MySQL - Flexible Server"**.
2.  **Configure**:
    - Choose a Resource Group.
    - Set a Server name.
    - **Authentication**: Select "MySQL authentication only" and set an Admin username and password. **Write these down.**
3.  **Networking**:
    - In the Networking tab, check **"Allow public access from any Azure service within Azure to this server"**. This allows your backend App Service to connect.
    - Add your current IP address to the firewall rules if you want to connect from your local machine.
4.  **Get Connection Details**: Once created, go to the "Connect" or "Overview" blade to find the **Server name** (Host).

---

## Step 2: Backend Deployment (Azure App Service)

1.  **Create Resource**: Create a new **"Web App"** in Azure.
    - **Publish**: Code.
    - **Runtime stack**: Node 20 LTS (or your preferred version).
    - **OS**: Linux.
2.  **Environment Variables**:
    - Go to your new Web App -> **Settings** -> **Environment variables**.
    - Add the following settings (using your database details from Step 1):
      - `DB_HOST`: Your MySQL Server name (e.g., `myserver.mysql.database.azure.com`)
      - `DB_USER`: Your Admin username
      - `DB_PASSWORD`: Your Admin password
      - `DB_NAME`: `db_gestionnaireLivre` (or your preferred DB name)
      - `DB_PORT`: `3306`
3.  **Deploy Code**:
    - Go to **Deployment Center**.
    - Source: **GitHub**.
    - Authorize and select your repository.
    - **Build provider**: GitHub Actions.
    - **Runtime stack**: Node.
    - **Version**: Node 20.
    - **App location**: `Code/backend` (Important! This tells Azure where your backend code lives).
    - Click **Save**. This will trigger a deployment.

> [!WARNING] > **Database Reset Issue**: Your current `sequelize.mjs` contains `.sync({ force: true })`. This **deletes all data** every time the backend restarts. For production, you **must** change this to `force: false` or remove the `force` option entirely.

---

## Step 3: Frontend Deployment (Azure Static Web Apps)

1.  **Create Resource**: Create a new **"Static Web App"** in Azure.
    - **Plan type**: Free (usually sufficient).
    - **Deployment details**: Select **GitHub**.
    - Authorize and select your repository.
2.  **Build Details**:
    - **Build Presets**: Vue.js.
    - **App location**: `/Code/frontend`
    - **Api location**: (Leave empty)
    - **Output location**: `dist`
3.  **Environment Variables**:
    - Once created, go to **Settings** -> **Environment variables**.
    - Add: `VITE_BACKEND_BASE_URL`
    - Value: The URL of your Backend Web App (from Step 2), e.g., `https://my-backend-app.azurewebsites.net`.
    - **Important**: For Vite, environment variables must be present _during the build_. You might need to re-run the GitHub Action workflow after adding this setting.

---

## Step 4: Final Configuration (CORS)

1.  **Update Backend CORS**:
    - Your backend currently might be blocking requests from your new frontend domain.
    - In `Code/backend/src/app.mjs` (or wherever CORS is configured), ensure the `origin` allows your new Static Web App URL (e.g., `https://brave-river-123.azurestaticapps.net`).
    - Alternatively, in the Azure Portal for the Backend Web App, go to **API** -> **CORS** and add your frontend URL there (if your code delegates CORS to Azure, but usually it's handled in code).

## Step 5: Verify

1.  Open your Static Web App URL.
2.  Check if images load (they should point to your backend URL).
3.  Try to log in or view books.
