import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth.js";
import securityMiddleware from "./middlewares/security.js";
import classesRoutes from "./routes/classes.js";
import subjectRoutes from "./routes/subjects.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

if (!process.env.FRONTEND_URL)
  throw new Error("FRONTEND_URL is not defined in environment variables");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Middleware
app.use(express.json());

app.use(securityMiddleware);

app.all("/api/auth/*splat", toNodeHandler(auth));

// Root GET route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the PERN Classroom Backend!" });
});

// routes
app.use("/api/subjects", subjectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classesRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
