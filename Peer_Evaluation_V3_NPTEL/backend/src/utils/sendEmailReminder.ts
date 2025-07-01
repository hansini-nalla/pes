import { Batch } from "../models/Batch.ts";
import { IUser } from "../models/User.ts";
import { sendReminderEmail } from "./email.ts";

export const sendBatchReminderEmails = async (
  batchId: string,
  subject: string,
  message: string
) => {
  try {
    const batch = await Batch.findById(batchId).populate(
      "students",
      "email name"
    );
    if (!batch) throw new Error("Batch not found");

    // 👇 Correct type assertion
    const students = batch.students as unknown as IUser[];

    for (const student of students) {
      if (student.email) {
        await sendReminderEmail(
          student.email,
          subject,
          message.replace("{{name}}", student.name)
        );
      }
    }

    console.log(
      `Email sent to ${students.length} student(s) in batch ${batch.name}`
    );
  } catch (err) {
    console.error("Failed to send batch reminder:", err);
  }
};
