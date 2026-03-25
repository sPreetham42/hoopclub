import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const Busboy = require("busboy");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB per file

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

function isAllowedMime(mimeType) {
  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType.startsWith("video/");
}

// Parses multipart/form-data for creating posts.
// - Accepts regular fields: title, content
// - Accepts files under field name `media[]` (front-end appends as `media`)
export function parsePostMediaUpload(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    // Not a multipart request; let it pass.
    return next();
  }

  ensureUploadsDir();

  const bb = Busboy({
    headers: req.headers,
    limits: {
      files: MAX_FILES,
      fileSize: MAX_FILE_SIZE_BYTES,
    },
  });

  const fields = {};
  const uploadedFiles = [];
  const pendingWrites = [];

  let hasError = false;

  bb.on("field", (name, val) => {
    fields[name] = val;
  });

  bb.on("file", (fieldname, file, info) => {
    const { filename, mimeType } = info;

    if (!isAllowedMime(mimeType)) {
      hasError = true;
      file.resume(); // discard stream
      return;
    }

    const safeOriginal = (filename || "file")
      .toString()
      .replace(/[^a-z0-9.\-_]/gi, "_");
    const uniqueName = `${Date.now()}-${safeOriginal}`;
    const outPath = path.join(uploadsDir, uniqueName);

    const writeStream = fs.createWriteStream(outPath);
    file.pipe(writeStream);

    const writePromise = new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        uploadedFiles.push({
          filename: uniqueName,
          mimetype: mimeType,
          url: `/uploads/${uniqueName}`,
        });
        resolve();
      });

      writeStream.on("error", (err) => {
        hasError = true;
        reject(err);
      });
    });

    pendingWrites.push(writePromise);
  });

  bb.on("error", (err) => {
    hasError = true;
    res.status(400).json({
      message: "Upload error",
      error: err?.message ?? "Unknown upload error",
    });
  });

  bb.on("finish", async () => {
    if (hasError) return;

    try {
      await Promise.all(pendingWrites);

      if (hasError) return;

      req.body = {
        ...req.body,
        ...fields,
        title: fields.title,
        content: fields.content,
      };
      req.uploadedFiles = uploadedFiles;
      next();
    } catch (err) {
      res.status(400).json({
        message: "Upload error",
        error: err?.message ?? "Unknown upload error",
      });
    }
  });

  req.pipe(bb);
}

// Parses multipart/form-data for updating user profile (avatar only).
// - Accepts regular fields (bio, team, position, etc.)
// - Accepts one image file under field name `avatar` (or any single file field)
export function parseAvatarUpload(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return next();
  }

  ensureUploadsDir();

  const bb = Busboy({
    headers: req.headers,
    limits: {
      files: 1,
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  const fields = {};
  const uploadedFiles = [];
  const pendingWrites = [];
  let hasError = false;

  bb.on("field", (name, val) => {
    fields[name] = val;
  });

  bb.on("file", (fieldname, file, info) => {
    const { filename, mimeType } = info;

    if (!mimeType || !mimeType.startsWith("image/")) {
      hasError = true;
      file.resume();
      return;
    }

    const safeOriginal = (filename || "avatar")
      .toString()
      .replace(/[^a-z0-9.\-_]/gi, "_");
    const uniqueName = `${Date.now()}-${safeOriginal}`;
    const outPath = path.join(uploadsDir, uniqueName);

    const writeStream = fs.createWriteStream(outPath);
    file.pipe(writeStream);

    const writePromise = new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        uploadedFiles.push({
          filename: uniqueName,
          mimetype: mimeType,
          url: `/uploads/${uniqueName}`,
        });
        resolve();
      });
      writeStream.on("error", (err) => {
        hasError = true;
        reject(err);
      });
    });

    pendingWrites.push(writePromise);
  });

  bb.on("error", (err) => {
    hasError = true;
    res.status(400).json({
      message: "Upload error",
      error: err?.message ?? "Unknown upload error",
    });
  });

  bb.on("finish", async () => {
    if (hasError) return;
    try {
      await Promise.all(pendingWrites);
      if (hasError) return;

      req.body = {
        ...req.body,
        ...fields,
      };
      req.uploadedFiles = uploadedFiles;
      next();
    } catch (err) {
      res.status(400).json({
        message: "Upload error",
        error: err?.message ?? "Unknown upload error",
      });
    }
  });

  req.pipe(bb);
}

