import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadImage(
  file,
  {
    folder = "images",
    maxSize = MAX_FILE_SIZE,
    allowedTypes = ALLOWED_TYPES,
  } = {}
) {
  // --------------------------------------------------
  // 1. Validate file exists
  // --------------------------------------------------

  if (!file) {
    throw new Error("Image file is required");
  }

  // --------------------------------------------------
  // 2. Validate File object
  // --------------------------------------------------

  if (!(file instanceof File)) {
    throw new Error("Invalid image file");
  }

  // --------------------------------------------------
  // 3. Validate file size
  // --------------------------------------------------

  if (file.size === 0) {
    throw new Error("Image file is empty");
  }

  if (file.size > maxSize) {
    throw new Error(
      `Image size must be less than ${Math.floor(maxSize / 1024 / 1024)}MB`
    );
  }

  // --------------------------------------------------
  // 4. Validate MIME type
  // --------------------------------------------------

  const extension = allowedTypes[file.type];

  if (!extension) {
    throw new Error(
      "Invalid image type. Only JPG, PNG, WEBP and GIF are allowed"
    );
  }

  // --------------------------------------------------
  // 5. Create upload directory
  // --------------------------------------------------

  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    folder
  );

  await mkdir(uploadDirectory, {
    recursive: true,
  });

  // --------------------------------------------------
  // 6. Generate unique filename
  // --------------------------------------------------

  const randomName = crypto.randomBytes(16).toString("hex");

  const fileName = `${Date.now()}-${randomName}.${extension}`;

  const filePath = path.join(
    uploadDirectory,
    fileName
  );

  // --------------------------------------------------
  // 7. Convert file to Buffer
  // --------------------------------------------------

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  // --------------------------------------------------
  // 8. Save file
  // --------------------------------------------------

  await writeFile(filePath, buffer);

  // --------------------------------------------------
  // 9. Return useful information
  // --------------------------------------------------

  const url = `/uploads/${folder}/${fileName}`;

  return {
    fileName,
    url,
    path: filePath,
    size: file.size,
    type: file.type,
  };
}