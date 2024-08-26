import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import beerRoutes from "./routes/beerRoutes";
import ratingRoutes from "./routes/ratingRoutes";
import sheetRoutes from "./routes/sheetRoutes";
import helmet from "helmet";
import cors from "cors";

dotenv.config();

const app: Application = express();

// Set up morgan for logging requests
app.use(morgan("combined"));

app.use(express.json());

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime();
  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationInMilliseconds = (seconds * 1000 + nanoseconds / 1e6).toFixed(
      3,
    );
    console.log(`Request processed in ${durationInMilliseconds}ms`);
  });
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/beers", beerRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/sheets", sheetRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.MONGO_URI) {
  console.log("Found database uri, Connectiong to database");
  mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
      console.error("Connection error", error.message);
    });
} else {
  console.log("No database uri, Starting server");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
