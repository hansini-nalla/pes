import { Request, Response } from "express";
//import { User } from "../../models/User.ts";
import { Course } from "../../models/Course.ts";
import { Batch } from "../../models/Batch.ts";
import { User } from "../../models/User.ts"; // Required for deleteBatchAndRelated
//import jwt from "jsonwebtoken";

// Add a new course
export const addCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // console.log(req);
    console.log(req.body);

    const { name, code } = req.body;

    const existing = await Course.findOne({ code });
    if (existing) {
      res.status(409).json({ message: "Course code already exists" });
      return;
    }

    const course = await Course.create({ name, code });
    res.status(201).json(course);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add course", error: err });
  }
};

// Update an existing course
/*export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const updated = await Course.findByIdAndUpdate(courseId, req.body, { new: true });

    if (!updated) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update course", error: err });
  }
};*/

// Delete a course and all its batches by course code
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    console.log("Trying to delete course with code:", code);

    const course = await Course.findOne({ code });

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    await Batch.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.status(204).send(); // No content
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "Failed to delete course", error: err });
  }
};

// ✅ New function: Delete course by ID and its batches (used in /:courseId route)
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
    console.error("Error deleting course by ID:", err);
    res.status(500).json({ message: "Failed to delete course by ID", error: err });
  }
};

// Get all courses
export const getAllCourses = async (_req: Request, res: Response) => {
  const courses = await Course.find();
  console.log("All course codes:", courses.map(c => c.code));
  res.json(courses);
};

// Get course by ID
/*export const getCourseById = async (req: Request, res: Response) => {
  console.log("Searching for course with ID:", req.params.id);
  const course = await Course.findById(req.params.id);
  console.log("Course found:", course);
  course ? res.json(course) : res.status(404).json({ message: 'Course not found' });
};*/

// Get all batches
export const getAllBatches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const batches = await Batch.find().populate('course', 'code name');
    console.log("All batches:", batches.map(b => ({ id: b._id, name: b.name })));
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve batches', error: err });
  }
};

// Get batch by ID
/*export const getBatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Searching for batch with ID:", req.params.id);
    const batch = await Batch.findById(req.params.id).populate('course', 'code name');
    console.log("Batch found:", batch);

    if (batch) {
      res.json(batch);
    } else {
      res.status(404).json({ message: 'Batch not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve batch', error: err });
  }
};*/

// Create a batch for a course
export const createBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, courseId, students } = req.body;
    console.log(courseId);
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

// Update a batch
/*export const updateBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { batchId } = req.params;
    const updated = await Batch.findByIdAndUpdate(batchId, req.body, { new: true });

    if (!updated) {
      res.status(404).json({ message: "Batch not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update batch", error: err });
  }
};*/

// Delete a batch
export const deleteBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    console.log("Trying to delete batch by name:", name);

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

// Delete a batch and remove references
export const deleteBatchAndRelated = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;

    await Batch.findByIdAndDelete(batchId);

    await Course.updateMany(
      { batches: batchId },
      { $pull: { batches: batchId } }
    );

    await User.updateMany(
      { role: "teacher", batches: batchId },
      { $pull: { batches: batchId } }
    );

    // Optional cleanup: await Exam.deleteMany({ batch: batchId });
    // Optional cleanup: await Flag.deleteMany({ batch: batchId });

    res.status(200).json({ message: "Batch and related data deleted." });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
};
