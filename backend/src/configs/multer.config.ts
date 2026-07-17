import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../../uploads/profiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const vehicleUploadDir = path.join(__dirname, "../../uploads/vehicles");
if (!fs.existsSync(vehicleUploadDir)) {
  fs.mkdirSync(vehicleUploadDir, { recursive: true });
}

const proofUploadDir = path.join(__dirname, "../../uploads/proofs");
if (!fs.existsSync(proofUploadDir)) {
  fs.mkdirSync(proofUploadDir, { recursive: true });
}

const fuelReceiptUploadDir = path.join(__dirname, "../../uploads/fuel-receipts");
if (!fs.existsSync(fuelReceiptUploadDir)) {
  fs.mkdirSync(fuelReceiptUploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const vehicleStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, vehicleUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `vehicle-${uniqueSuffix}${ext}`);
  },
});

const proofStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, proofUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `proof-${uniqueSuffix}${ext}`);
  },
});

const fuelReceiptStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, fuelReceiptUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `fuel-receipt-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const vehicleUpload = multer({
  storage: vehicleStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const proofUpload = multer({
  storage: proofStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const fuelReceiptUpload = multer({
  storage: fuelReceiptStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
