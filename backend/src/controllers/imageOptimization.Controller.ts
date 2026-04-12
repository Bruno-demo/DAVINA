import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function optimizeAndSave(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided." });
      return;
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const outputPath = path.join(UPLOADS_DIR, filename);

    await sharp(req.file.buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const url = `/uploads/${filename}`;
    res.status(200).json({ message: "Image optimized and saved.", data: { url, filename } });
  } catch (error) {
    console.error("Image optimization error:", (error as Error).message);
    res.status(500).json({ error: "Failed to process image." });
  }
}

async function optimizeThumbnail(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided." });
      return;
    }

    const filename = `thumb-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const outputPath = path.join(UPLOADS_DIR, filename);

    await sharp(req.file.buffer)
      .resize(300, 300, { fit: "cover" })
      .webp({ quality: 75 })
      .toFile(outputPath);

    const url = `/uploads/${filename}`;
    res.status(200).json({ message: "Thumbnail created.", data: { url, filename } });
  } catch (error) {
    res.status(500).json({ error: "Failed to create thumbnail." });
  }
}

export { upload, optimizeAndSave, optimizeThumbnail };
