import path from "path";

export const UPLOADS_DIR = path.resolve(__dirname,"../../uploads");
export const PDF_UPLOAD_DIR = path.join(UPLOADS_DIR,"pdfs");
export const IMAGE_UPLOAD_DIR = path.join(UPLOADS_DIR,"images");