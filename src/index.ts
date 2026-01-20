import cors from "cors";
import express from "express";

const app = express();
const PORT = 8000;

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

// Root GET route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the PERN Classroom Backend!" });
});

// Import and use subjects routes
import subjectRoutes from "./routes/subjects";

app.use("/api/subjects", subjectRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
