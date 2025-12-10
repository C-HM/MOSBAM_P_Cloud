# MOSBAM P_Cloud Project - Azure Deployment Guide

This guide details the strict steps to deploy the MOSBAM Cloud WebApp to Azure using a **Single Web App** (Frontend + Backend) and a Shared MySQL Flexible Server.

## 1. Prerequisites & Rules

- **Resource Group**: Use the one provided by your teacher.
- **Resource Tagging**: **CRITICAL**. Every resource you create in Azure MUST have the tag:
  - **Name**: `Groupe` (or similar identifier used by your class)
  - **Value**: `%nom_groupe%` (Your 3-letter group code, e.g., `ABC`).
- **Cost Management**: You are responsible for stopping resources when not in use.

---

## 2. Infrastructure Setup (Azure Portal)

### Azure App Service (Web App)

You only need ONE Web App.

1. Search for **"Web App"** -> Create.
2. **Basics**:
   - **Resource Group**: Select your class group.
   - **Name**: `mosbam-app-grpXY` (Unique).
   - **Publish**: `Code`.
   - **Runtime stack**: `Node 20 LTS`.
   - **OS**: `Linux`.
   - **Region**: `France Central`.
   - **Pricing Plan**: **Basic B1** (Required for VNet Integration). **Free Tier will NOT work**.
3. **Tags** (Important):
   - Key: `Groupe` | Value: `[YOUR_GROUP_ID]`
4. **Review + create**.

### Virtual Network Integration (CRITICAL)

Since your database is in a VNet, your App must join it to connect.

1. Go to your new Web App -> **Networking**.
2. Under "Outbound Traffic", click on **VNet integration**.
3. Click **Add VNet**.
4. Select your **Subscription** and the **Virtual Network** (e.g., `vnet-mosbam...`).
5. Select an existing **Subnet** or create a new one (e.g., `snet-app`).
6. Click **Connect**.

---

## 3. Database Configuration

**Server**: `cmid3b-srv-db.mysql.database.azure.com` | **User**: `cmi3badmin` | **Pass**: `.etml-`

1. **Create Database**: Connect via MySQL Workbench and run:
   ```sql
   CREATE DATABASE db_mosbam_grpXY;
   ```
2. **Configure Web App**:
   - Go to your Web App -> **Settings** -> **Environment variables**.
   - Add:
     - `DB_HOST`: `cmid3b-srv-db.mysql.database.azure.com`
     - `DB_USER`: `cmi3badmin`
     - `DB_PASSWORD`: `.etml-`
     - `DB_PORT`: `3306`
     - `DB_NAME`: `db_mosbam_grpXY` (The name you created).
     - `CORS_ORIGIN`: `*`
     - `PORT`: `8080`

---

## 4. GitHub Actions Configuration

1. In your Repo -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add these Secrets:

| Secret Name                    | Value              | Description                                                |
| ------------------------------ | ------------------ | ---------------------------------------------------------- |
| `AZURE_WEBAPP_NAME`            | `mosbam-app-grpXY` | Your Web App Name.                                         |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | _(XML Content)_    | Download from Web App Overview -> **Get publish profile**. |

---

## 5. Deployment & Cost Management

- **Trigger**: Push to `main` OR Create a Tag `v*` (e.g., `v1.0`).
- **Stop Resource**: Go to **Overview** -> **Stop** at the end of the day to save costs.
