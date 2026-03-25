import prisma from "../lib/prisma.js";

export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const uploadedFiles = Array.isArray(req.uploadedFiles)
      ? req.uploadedFiles
      : [];
    const media =
      uploadedFiles.length > 0
        ? uploadedFiles.map((f) => ({
            type: f.mimetype?.startsWith("image/") ? "image" : "video",
            url: f.url,
          }))
        : null;

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
        media,
      },
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const postId = Number(req.params.postId);
    const { content } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!postId || !content || !String(content).trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await prisma.comment.create({
      data: {
        content: String(content).trim(),
        postId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.json(comment);
  } catch (err) {
    next(err);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const postId = Number(req.params.postId);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!postId) return res.status(400).json({ message: "Invalid postId" });

    await prisma.like.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      update: {},
      create: {
        userId,
        postId,
      },
    });

    return res.json({ liked: true });
  } catch (err) {
    next(err);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const postId = Number(req.params.postId);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!postId) return res.status(400).json({ message: "Invalid postId" });

    await prisma.like.deleteMany({
      where: { userId, postId },
    });

    return res.json({ liked: false });
  } catch (err) {
    next(err);
  }
};