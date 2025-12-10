# MOSBAM P_Cloud Project - Azure Deployment Guide

This guide details the strict steps to deploy the MOSBAM Cloud WebApp to Azure, compliant with the school project requirements (PDF).

## 1. Prerequisites & Rules

- **Resource Group**: Use the one provided by your teacher.
- **Resource Tagging**: **CRITICAL**. Every resource you create in Azure MUST have the tag:
  - **Name**: `Groupe` (or similar identifier used by your class)
  - **Value**: `%nom_groupe%` (Your 3-letter group code, e.g., `ABC`).
- **Cost Management**: You are responsible for stopping resources when not in use.
- **Triggers**: The deployment pipeline runs on `push` to main OR on `git tag` (e.g., `v1.0.0`).

---

## 2. Infrastructure Setup (Azure Portal)

49b317614ec4c177d4500aaadb604763e9f217eaca35414279f37d54cf6fedd303-13cbb546-006a-42eb-9e10-fa49920263f600309260d4a3f003

### A. Backend - Azure App Service (Web App)

1. Search for **"Web App"** -> Create.
2. **Basics**:
   - **Resource Group**: Select your class group.
   - **Name**: `mosbam-backend-grpXY` (Unique).
   - **Publish**: `Code`.
   - **Runtime stack**: `Node 20 LTS`.
   - **OS**: `Linux`.
   - **Region**: `France Central`.
   - **Pricing Plan**: `Free F1` (or Basic B1).
3. **Tags** (Important):
   - Key: `Groupe` | Value: `[YOUR_GROUP_ID]`
4. **Review + create**.

### B. Frontend - Azure Static Web App

1. Search for **"Static Web Apps"** -> Create.
2. **Basics**:
   - **Resource Group**: Same group.
   - **Name**: `mosbam-frontend-grpXY`.
   - **Plan type**: `Free`.
   - **Deployment details**: Select **"Other"**.
3. **Tags**:
   - Key: `Groupe` | Value: `[YOUR_GROUP_ID]`
4. **Review + create**.
5. Go to the resource -> **Manage deployment token** -> Copy it.

---

## 3. Database Configuration

**Server**: `cmid3b-srv-db.mysql.database.azure.com` | **User**: `cmi3badmin` | **Pass**: `.etml-`

1. **Create Database**: Connect via MySQL Workbench and run:
   ```sql
   CREATE DATABASE db_mosbam_grpXY;
   ```
2. **Configure Backend**:
   - Go to your Backend Web App -> **Settings** -> **Environment variables**.
   - Add:
     - `DB_HOST`: `cmid3b-srv-db.mysql.database.azure.com`
     - `DB_USER`: `cmi3badmin`
     - `DB_PASSWORD`: `.etml-`
     - `DB_PORT`: `3306`
     - `DB_NAME`: `db_mosbam_grpXY`
     - `CORS_ORIGIN`: `*` (or your Static Web App URL)
     - `PORT`: `8080` (Internal port)

---

## 4. GitHub Actions Configuration

1. In your Repo -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add these Secrets:

| Secret Name                            | Value                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `AZURE_WEBAPP_BACKEND_NAME`            | Your Backend App Name (e.g., `mosbam-backend-grpXY`)                                        |
| `AZURE_WEBAPP_BACKEND_PUBLISH_PROFILE` | Content of the Publish Profile file (Download from Backend Overview -> Get publish profile) |
| `AZURE_STATIC_WEB_APP_TOKEN`           | The Deployment Token from Step 2.B.5                                                        |
| `VITE_API_BASE_URL`                    | `https://mosbam-backend-grpXY.azurewebsites.net/api/` (Must match your backend URL)         |

---

## 5. Deployment & Triggers

The workflow is configured to run automatically:

1. **Push** to `main`: `git push origin main`
2. **Tag**: `git tag v1.0.0` -> `git push origin v1.0.0`

### Cost Management (Daily Shutdown)

To comply with "automatiser l’arrêt des ressources" or manual stop:

- **Backend**: Go to the App Service -> **Overview** -> **Stop**. (Do this at the end of every day).
- **Database**: The shared server is managed by teachers, you don't stop it.
- **Frontend**: Static Web Apps are serverless and don't need stopping (Free tier).

## 6. Future: MSAL Authentication

When you implement MSAL (Phase 3), you will need to:

1. Register an App in **Microsoft Entra ID**.
2. Add **Redirect URIs**:
   - Local: `http://localhost:5173`
   - Cloud: Your Static Web App URL (e.g., `https://brave-cliff-123.azurestaticapps.net`)
3. Tag the App Registration with `%nom_groupe%` if possible/required.
