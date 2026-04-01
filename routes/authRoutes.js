import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// ✅ Test route (IMPORTANT for browser testing)
router.get("/", (req, res) => {
  res.send("Auth API is working ✅");
});

router.post("/register", register);
router.post("/login", login);

export default router;