import express from "express";
import connectDB from "./config/db.ts";
import studentRoutes from "./routes/student/student.routes.ts";
import taRoutes from "./routes/ta/ta.routes.ts"; // Keep TA route
import "./models/Course.ts";
import "./models/Batch.ts";
import "./models/Exam.ts";
import "./models/User.ts";
import "./models/Flag.ts"; // Ensure Flag model is imported
import "./jobs/evaluationReminder.job.ts";
import authRoutes from "./routes/authorization/auth.routes.ts"; // Keep this line
import adminroutes from './routes/admin/admin.routes.ts'; // Add admin routes
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});

app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/admin", adminroutes); // Keep admin route
app.use("/api/student", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ta", taRoutes); // Keep TA route

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
