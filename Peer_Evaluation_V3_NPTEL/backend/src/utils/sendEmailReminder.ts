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

// Send Emails to TAs when assigned to a batch
export const sendTAAssignmentEmails = async (batchId: string) => {
  try {
    const batch = await Batch.findById(batchId)
      .populate("ta", "name email")
      .select("name ta");

    if (!batch || !batch.ta || batch.ta.length === 0) {
      console.log("No TAs to notify.");
      return;
    }

    for (const taUser of batch.ta as unknown as {
      name: string;
      email: string;
    }[]) {
      if (!taUser.email) continue;

      const subject = "TA Assignment Notification";
      const message = `Dear ${taUser.name},\n\nYou have been assigned as a Teaching Assistant for the batch "${batch.name}".\nPlease log in to your dashboard for details.\n\nRegards,\n\nPES Team`;

      await sendReminderEmail(taUser.email, subject, message);
      console.log(`TA assignment email sent to ${taUser.name}`);
    }
  } catch (err) {
    console.error("Error sending TA assignment emails:", err);
  }
};
