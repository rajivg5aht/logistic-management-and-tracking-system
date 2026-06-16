import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/user.route";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:4000", "http://127.0.0.1:4000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Logistics Management API is running",
  });
});

app.use("/api/v1/auth", userRoutes);

app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;