import express from "express";
import {
  addComment,
  createPost,
  getPosts,
  likePost,
  unlikePost,
} from "../controllers/post.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { parsePostMediaUpload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getPosts);
router.post("/", authMiddleware, parsePostMediaUpload, createPost);

router.post("/:postId/comments", authMiddleware, addComment);
router.post("/:postId/like", authMiddleware, likePost);
router.delete("/:postId/like", authMiddleware, unlikePost);

export default router;