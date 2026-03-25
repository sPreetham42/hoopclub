import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";

import errorHandler from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

//app.get("/", (req, res) => {
  //res.send("Backend is running");
//});

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

app.use(errorHandler);

export default app;