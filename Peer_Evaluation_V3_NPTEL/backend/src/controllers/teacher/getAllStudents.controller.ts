// controllers/teacher/getAllStudents.controller.ts
import { Request, Response } from "express";
import { User } from "../../models/User.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

export const getAllStudents = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const students = await User.find({ role: "student" }, "name email");
    res.status(200).json({ students });
  } catch (err) {
    console.error("Failed to fetch students:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
