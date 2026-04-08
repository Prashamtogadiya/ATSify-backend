import { Readable } from "stream";
import { google } from "googleapis";

const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";

const readEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getDriveClient = () => {
  const clientId = readEnv("GOOGLE_DRIVE_CLIENT_ID");
  const clientSecret = readEnv("GOOGLE_DRIVE_CLIENT_SECRET");
  const refreshToken = readEnv("GOOGLE_DRIVE_REFRESH_TOKEN");
  const redirectUri =
    process.env.GOOGLE_DRIVE_REDIRECT_URI?.trim() ||
    "https://developers.google.com/oauthplayground";

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  auth.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: "v3", auth });
};

const escapeQueryValue = (value: string) => value.replace(/'/g, "\\'");

const makeSafeFolderName = (email: string) => {
  const prefix = email.split("@")[0] || "user";
  const safe = prefix.replace(/[^a-zA-Z0-9._-]/g, "_").trim();
  return safe || "user";
};

export const ensureUserDriveFolder = async (email: string): Promise<string> => {
  const drive = getDriveClient();
  const baseFolderId = readEnv("GOOGLE_DRIVE_BASE_FOLDER_ID");
  const folderName = makeSafeFolderName(email);

  const existing = await drive.files.list({
    q: `'${baseFolderId}' in parents and name='${escapeQueryValue(folderName)}' and mimeType='${DRIVE_FOLDER_MIME}' and trashed=false`,
    fields: "files(id,name)",
    pageSize: 1,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });

  const existingFolder = existing.data.files?.[0];
  if (existingFolder?.id) {
    return existingFolder.id;
  }

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: DRIVE_FOLDER_MIME,
      parents: [baseFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  const folderId = created.data.id;
  if (!folderId) {
    throw new Error("Failed to create user folder in Google Drive");
  }

  return folderId;
};

export const uploadBufferToDrive = async (input: {
  name: string;
  mimeType: string;
  buffer: Buffer;
  parentFolderId: string;
}) => {
  const drive = getDriveClient();

  const created = await drive.files.create({
    requestBody: {
      name: input.name,
      parents: [input.parentFolderId],
    },
    media: {
      mimeType: input.mimeType,
      body: Readable.from(input.buffer),
    },
    fields: "id,name,mimeType,webViewLink,webContentLink",
    supportsAllDrives: true,
  });

  if (!created.data.id) {
    throw new Error(`Drive upload failed for ${input.name}`);
  }

  return {
    id: created.data.id,
    name: created.data.name || input.name,
    mimeType: created.data.mimeType || input.mimeType,
    webViewLink: created.data.webViewLink || null,
    webContentLink: created.data.webContentLink || null,
  };
};

export const downloadDriveFileBuffer = async (fileId: string): Promise<Buffer> => {
  const drive = getDriveClient();
  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    {
      responseType: "stream",
    }
  );

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    response.data.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    response.data.on("end", () => resolve());
    response.data.on("error", (error: Error) => reject(error));
  });

  return Buffer.concat(chunks);
};

export const getDriveFileStream = async (fileId: string) => {
  const drive = getDriveClient();
  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    {
      responseType: "stream",
    }
  );

  return response.data;
};
