import express from "express";
import connectDB from "./config/db.ts";
import studentRoutes from "./routes/student/student.routes.ts";
import "./models/Course.ts";
import "./models/Batch.ts";
import "./models/Exam.ts";
import "./models/User.ts";
import "./jobs/evaluationReminder.job.ts";
import authRoutes from './routes/authorization/auth.routes.ts';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect DB
connectDB();

// Student Routes
app.use("/api/student", studentRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});