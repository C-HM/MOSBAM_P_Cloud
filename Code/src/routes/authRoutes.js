import express from "express";
import { getAuthCodeUrl, acquireToken, logout } from "../controllers/authController.js";

const router = express.Router();

router.get("/signin", getAuthCodeUrl);
router.get("/redirect", acquireToken); // MSAL redirects here with code in query
router.get("/signout", logout);

export { router as authRouter };
