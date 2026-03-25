import express from "express";
import { createPost, getPosts } from "../controllers/post.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", authMiddleware, createPost);

export default router;