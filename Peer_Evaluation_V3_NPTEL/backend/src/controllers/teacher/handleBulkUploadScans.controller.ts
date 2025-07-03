import { Request, Response } from "express";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
import fs from "fs";
import os from "os";
import path from "path";
import { Jimp } from "jimp";
import { createRequire } from "module";
import { Exam } from "../../models/Exam.ts";
import { Submission } from "../../models/Submission.ts";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";

const require = createRequire(import.meta.url);
const jsQR = require("jsqr");

const JWT_SECRET = process.env.JWT_SECRET || "fallbackSecret";

interface QRPayload {
  studentId: string;
  examId: string;
}

const convertPdfToImage = async (pdfBuffer: Buffer): Promise<string> => {
  const srcDoc = await PDFDocument.load(pdfBuffer);
  const newDoc = await PDFDocument.create();

  const [firstPage] = await newDoc.copyPages(srcDoc, [0]);
  newDoc.addPage(firstPage);

  const singlePageBuffer = await newDoc.save();
  const tempPdfPath = path.join(os.tmpdir(), `page1-${Date.now()}.pdf`);
  fs.writeFileSync(tempPdfPath, singlePageBuffer);

  const outputImagePath = path.join(os.tmpdir(), `page1-${Date.now()}.png`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(`file://${tempPdfPath}`, { waitUntil: "networkidle0" });

  const clip = await page.evaluate(() => {
    const { scrollWidth, scrollHeight } = document.documentElement;
    return { x: 0, y: 0, width: scrollWidth, height: scrollHeight };
  });

  await page.setViewport({ width: clip.width, height: clip.height });

  await page.screenshot({
    path: outputImagePath as `${string}.png`,
    clip
  });

  await browser.close();
  return outputImagePath;
};

const decodeQrFromImage = async (imagePath: string): Promise<QRPayload> => {
  const image = await Jimp.read(imagePath);
  const { data, width, height } = image.bitmap;

  const qrCode = jsQR(new Uint8ClampedArray(data), width, height);

  if (!qrCode) throw new Error("QR not detected");

  let decoded: any;
  try {
    const qrContent = JSON.parse(qrCode.data);
    if (!qrContent.token) throw new Error("Missing JWT token in QR");
    decoded = jwt.verify(qrContent.token, JWT_SECRET);
  } catch (err: any) {
    throw new Error("Invalid or expired QR JWT");
  }

  if (!decoded.studentId || !decoded.examId) {
    throw new Error("QR payload missing studentId or examId");
  }

  return decoded as QRPayload;
};

export const handleBulkUploadScans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { examId } = req.params;

    const exam = await Exam.findById(examId).populate("course batch");
    if (!exam) {
      res.status(404).json({ message: "Exam not found" });
      return;
    }

    const results: {
      fileName: string;
      studentId?: string;
      imagePath?: string;
      error?: string;
    }[] = [];

    for (const file of files) {
      let imagePath = "";
      try {
        if (!file.buffer || file.buffer.length < 100) {
          throw new Error("Invalid file buffer");
        }

        imagePath = await convertPdfToImage(file.buffer);
        const qrData = await decodeQrFromImage(imagePath);

        if (qrData.examId !== examId) {
          throw new Error("QR exam ID mismatch");
        }

        await Submission.findOneAndUpdate(
          {
            student: qrData.studentId,
            exam: examId
          },
          {
            student: new Types.ObjectId(qrData.studentId),
            exam: new Types.ObjectId(examId),
            course: exam.course,
            batch: exam.batch,
            answerPdf: file.buffer,
            answerPdfMimeType: file.mimetype,
            submittedAt: new Date()
          },
          { upsert: true }
        );

        results.push({
          fileName: file.originalname,
          studentId: qrData.studentId,
          imagePath
        });
      } catch (err) {
        results.push({
          fileName: file.originalname,
          error: err instanceof Error ? err.message : "Unknown error"
        });
      } finally {
        if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      message: "Step 1–5 complete. Submissions saved to DB.",
      results
    });
  } catch (err) {
    console.error("❌ Final crash in bulk upload:", err);
    res.status(500).json({ message: "Server crash during bulk processing" });
  }
};
