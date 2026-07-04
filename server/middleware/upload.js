const multer = require("multer");
const path = require("path");

// Store in memory - buffer is streamed straight to Cloudinary + pdf-parse, never written to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext) && file.mimetype === "application/pdf") {
    return cb(null, true);
  }
  cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;
