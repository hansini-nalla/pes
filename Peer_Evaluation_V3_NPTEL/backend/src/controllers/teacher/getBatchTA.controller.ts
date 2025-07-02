import { Request, Response } from "express";
import { Batch } from "../../models/Batch.ts";
import { Types } from "mongoose";

export const getBatchTA = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { batchId } = req.params;

    if (!Types.ObjectId.isValid(batchId)) {
      res.status(400).json({ message: "Invalid batch ID" });
      return;
    }

    const batch = await Batch.findById(batchId).populate("ta", "name email");

    if (!batch) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    const taArray =
      batch.ta instanceof Array
        ? batch.ta.map((ta: any) => ({
            name: ta.name,
            email: ta.email,
          }))
        : [];

    res.json({ ta: taArray });
  } catch (error) {
    console.error("Error fetching TA:", error);
    res.status(500).json({ message: "Server error" });
  }
};
