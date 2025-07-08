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
import { UIDMap } from "../../models/UIDMap.ts";
import { Types } from "mongoose";

const require = createRequire(import.meta.url);
const jsQR = require("jsqr");

interface QRPayload {
  uid: string;
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

  let parsed: any;
  try {
    parsed = JSON.parse(qrCode.data);
  } catch (err) {
    throw new Error("QR data is not valid JSON");
  }

  if (!parsed.uid) {
    throw new Error("QR payload missing UID");
  }

  return parsed as QRPayload;
};

const extractPdfWithoutFirstPage = async (pdfBuffer: Buffer): Promise<Buffer> => {
  const srcDoc = await PDFDocument.load(pdfBuffer);
  const totalPages = srcDoc.getPageCount();

  if (totalPages <= 1) {
    throw new Error("Cannot remove first page from a single-page PDF.");
  }

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(srcDoc, [...Array(totalPages - 1)].map((_, i) => i + 1));
  pages.forEach(page => newDoc.addPage(page));

  const uint8Array = await newDoc.save();
  return Buffer.from(uint8Array); // 👈 Fix: convert to proper Node.js Buffer
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

        const uidEntry = await UIDMap.findOne({ uid: qrData.uid });
        if (!uidEntry) {
          throw new Error("Invalid UID – not mapped");
        }

        if (uidEntry.examId.toString() !== examId) {
          throw new Error("UID mismatch with target exam");
        }

        const trimmedPdf = await extractPdfWithoutFirstPage(file.buffer);

        await Submission.findOneAndUpdate(
          {
            student: uidEntry.studentId,
            exam: uidEntry.examId
          },
          {
            student: new Types.ObjectId(uidEntry.studentId),
            exam: new Types.ObjectId(uidEntry.examId),
            course: exam.course,
            batch: exam.batch,
            answerPdf: trimmedPdf,
            answerPdfMimeType: file.mimetype,
            submittedAt: new Date()
          },
          { upsert: true }
        );

        results.push({
          fileName: file.originalname,
          studentId: uidEntry.studentId.toString(),
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
      results,
      successCount: results.filter(r => !r.error).length,
      failureCount: results.filter(r => r.error).length
    });
  } catch (err) {
    console.error("❌ Final crash in bulk upload:", err);
    res.status(500).json({ message: "Server crash during bulk processing" });
  }
};
