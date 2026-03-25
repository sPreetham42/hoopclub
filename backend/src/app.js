import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";

import errorHandler from "./middleware/error.middleware.js";

// Ensure we always load the backend's env file, regardless of the cwd.
// backend/src/app.js -> backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

//app.get("/", (req, res) => {
  //res.send("Backend is running");
//});

app.use(cors({
  origin: "https://hoopclub-a9yf4hq35-spreetham42s.vercel.app/",
  credentials: true
}));
app.use(express.json());

// Serve uploaded media files.
app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../uploads"))
);

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.use(errorHandler);

export default app;