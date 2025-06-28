import { Request, Response } from "express";
import { Batch } from "../../models/Batch.ts";
import { User } from "../../models/User.ts";
import AuthenticatedRequest from "../../middlewares/authMiddleware.ts";

export const assignTaToBatch = async ( 
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { batchId } = req.params;
    const { taEmail } = req.body;
    const ta = await User.findOne({ email: taEmail, role: "ta" });
    if (!ta) {
      res.status(404).json({ message: "TA not found" });
      return;
    }
    const batch = await Batch.findById(batchId);
    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }
    if (batch.instructor.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Not authorized to modify this batch" });
      return;
    }
    if (!batch.assisstant.includes(ta.id)) {
      batch.assisstant.push(ta.id);
      await batch.save();
    }
    res.json({ message: "TA assigned successfully", batch });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign TA" });
  }
};