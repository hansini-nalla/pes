import { Request, Response } from "express";
import { Course } from "../../models/Course.ts";
import { Batch } from "../../models/Batch.ts";
import { User } from "../../models/User.ts"; // Needed for deleteBatchAndRelated

// Add a new course
export const addCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body;

    const existing = await Course.findOne({ code });
    if (existing) {
      res.status(409).json({ message: "Course code already exists" });
      return;
    }

    const course = await Course.create({ name, code });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: "Failed to add course", error: err });
  }
};

// Delete a course and all its batches
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    const course = await Course.findOne({ code });
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    await Batch.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete course", error: err });
  }
};

// Get all courses
export const getAllCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve courses", error: err });
  }
};

// Get all batches with course info
export const getAllBatches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const batches = await Batch.find().populate('course', 'code name');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve batches', error: err });
  }
};

// Create a batch for a course
export const createBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, courseId, students } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const batch = await Batch.create({ name, course: courseId, students });
    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ message: "Failed to create batch", error: err });
  }
};

// Delete a batch by name
export const deleteBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;

    const deleted = await Batch.findOneAndDelete({ name });
    if (!deleted) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete batch", error: err });
  }
};

export const deleteCourseAndBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    await Batch.deleteMany({ course: courseId });
    await Course.findByIdAndDelete(courseId);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete course", error: err });
  }
};
