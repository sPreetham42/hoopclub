import prisma from "../lib/prisma.js";

export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // 🔒 Validation
    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    // 🔐 Ensure user exists (from auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const post = await prisma.post.create({
      data: {
        title,                     // ✅ FIXED
        content,
        authorId: req.user.id,
      },
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};