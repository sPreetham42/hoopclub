import prisma from "../lib/prisma.js";

function toSafeUser(user) {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export const getMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    return res.json(toSafeUser(user));
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { bio, team, position } = req.body || {};
    const uploadedFiles = Array.isArray(req.uploadedFiles)
      ? req.uploadedFiles
      : [];

    const data = {};
    if (bio !== undefined) data.bio = bio;
    if (team !== undefined) data.team = team;
    if (position !== undefined) data.position = position;

    if (uploadedFiles.length > 0 && uploadedFiles[0]?.url) {
      data.avatarUrl = uploadedFiles[0].url;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    return res.json(toSafeUser(updated));
  } catch (err) {
    next(err);
  }
};

