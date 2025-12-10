import "dotenv/config";
import express from "express";
import cors from "cors";
import { auth } from "./auth/auth.mjs";
import swaggerUi from "swagger-ui-express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Recréer __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Configuration de CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/images"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route pour gérer l'upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier téléchargé." });
  }

  // Retourner le chemin relatif de l'image
  res.json({ filePath: `/images/${req.file.filename}` });
});

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(express.json());

import { loginRouter } from "./routes/login.mjs";
app.use("/api/login", loginRouter);

import { booksRouter } from "./routes/books.mjs";
app.use("/api/books", booksRouter);

import { userRouter } from "./routes/users.mjs";
app.use("/api/users", auth, userRouter);

import { categoriesRouter } from "./routes/categories.mjs";
app.use("/api/categories", auth, categoriesRouter);

import { authorsRouter } from "./routes/authors.mjs";
app.use("/api/authors", auth, authorsRouter);

import { evaluerRouter } from "./routes/evaluer.mjs";
app.use("/api/evaluations", auth, evaluerRouter);

import { swaggerSpec } from "./swagger.mjs";
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

import { sequelize, initDb } from "./db/sequelize.mjs";
sequelize
  .authenticate()
  .then((_) =>
    console.log("La connexion à la base de données a bien été établie")
  )
  .catch((error) => console.error("Impossible de se connecter à la DB"));
initDb();

app.use(({ res }) => {
  const message =
    "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
  res.status(404).json(message);
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});

// Serve Frontend Static Files
const clientBuildPath = path.join(__dirname, "client");
app.use(express.static(clientBuildPath));

// SPA Catch-all Route (must be last)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});
