import { Response } from "express";
import { Batch } from "../../models/Batch.ts";
import { User } from "../../models/User.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";
import { sendTAAssignmentEmails } from "../../utils/sendEmailReminder.ts";
import { Types } from "mongoose";

export const assignTaToBatch = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { batchId } = req.params;
    const { studentId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    if (batch.instructor.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Not authorized to modify this batch" });
      return;
    }

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    if (batch.ta.includes(studentId)) {
      res
        .status(400)
        .json({ message: "Student is already a TA for this batch" });
      return;
    }

    batch.ta.push(student._id as Types.ObjectId);
    await batch.save();
    const batchID = batch._id as Types.ObjectId;
    sendTAAssignmentEmails(batchID.toString());

    res.json({
      message: "Student promoted to TA and assigned to batch",
      batch,
    });
  } catch (err) {
    console.error("Assign TA Error:", err);
    res.status(500).json({ message: "Failed to assign TA" });
  }
};
