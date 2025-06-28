import { Response } from "express";
import { Batch } from "../../models/Batch.ts";
import { User } from "../../models/User.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";
import { Types } from "mongoose";

export const assignTaToBatch = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { batchId } = req.params;
    const { taEmail } = req.body;

    // Find the TA by email and role
    const ta = await User.findOne({ email: taEmail, role: "ta" });
    if (!ta) {
      res.status(404).json({ message: "TA not found" });
      return;
    }

    // Find the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    // Ensure the requesting user is the instructor for this batch
    if (batch.instructor.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Not authorized to modify this batch" });
      return;
    }

    // Assign the TA to the batch (cast to ObjectId)
    batch.ta = ta._id as Types.ObjectId;
    await batch.save();

    res.json({ message: "TA assigned successfully", batch });
  } catch (err) {
    console.error("Assign TA Error:", err);
    res.status(500).json({ message: "Failed to assign TA" });
  }
};
