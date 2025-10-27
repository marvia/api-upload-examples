import { splitFile } from "./upload-helper";
import {
  initMultipartUpload,
  uploadPart,
  completeMultipartUpload,
} from "../services/upload-service";

export interface InitMultipartUploadResponse {
  uuid: string;
  numberOfParts: number;
  parts: { url: string; partNumber: number }[];
}

export interface UploadCallbacks {
  setStatus: (status: string) => void;
  setUploadProgress: (progress: number) => void;
  setUploadResult: (
    result: { sysFileUuid: string; url: string } | null
  ) => void;
}

export interface ProgressManager {
  interval: NodeJS.Timeout | null;
  start: (targetProgress: number, currentProgress: number) => void;
  stop: () => void;
}

// NOTE : This is a fake progress manager to simulate the progress of the upload.
export function createProgressManager(
  setUploadProgress: (progress: number) => void
): ProgressManager {
  let interval: NodeJS.Timeout | null = null;

  return {
    interval,
    start(targetProgress: number, currentProgress: number) {
      if (interval) clearInterval(interval);
      let fakeProgress = currentProgress;
      interval = setInterval(() => {
        fakeProgress += 1;
        if (fakeProgress < targetProgress) {
          setUploadProgress(fakeProgress);
        }
      }, 120);
    },
    stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
  };
}

export async function initializeUpload(
  file: File,
  apiKey: string,
  callbacks: UploadCallbacks
) {
  callbacks.setStatus("Initializing multipart upload...");

  const initRes = await initMultipartUpload({
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
    apiKey,
  });

  return initRes;
}

export async function uploadFileParts(
  file: File,
  initRes: InitMultipartUploadResponse,
  callbacks: UploadCallbacks,
  progressManager: ProgressManager
) {
  callbacks.setStatus("Splitting file and uploading parts...");

  const parts = splitFile(file, initRes.numberOfParts);
  const eTags: string[] = [];
  const totalParts = parts.length;

  for (let i = 0; i < parts.length; i++) {
    callbacks.setStatus(`Uploading part ${i + 1} of ${parts.length}...`);

    const partTarget = Math.round(((i + 1) / totalParts) * 100);
    const partStart = Math.round((i / totalParts) * 100);

    progressManager.start(partTarget, partStart);

    const eTag = await uploadPart(initRes.parts[i].url, parts[i]);
    eTags.push(eTag || "");

    progressManager.stop();
    callbacks.setUploadProgress(partTarget);
  }

  return { eTags, parts };
}

export async function finalizeUpload(
  initRes: InitMultipartUploadResponse,
  eTags: string[],
  apiKey: string,
  callbacks: UploadCallbacks
) {
  callbacks.setStatus("Finalizing upload...");

  const completeRes = await completeMultipartUpload({
    uuid: initRes.uuid,
    parts: initRes.parts.map((part: { partNumber: number }, idx: number) => ({
      partNumber: part.partNumber,
      eTag: eTags[idx],
    })),
    apiKey,
  });

  callbacks.setStatus("Upload complete!");
  callbacks.setUploadProgress(100);

  callbacks.setUploadResult({
    sysFileUuid: completeRes.fileUuid,
    url: completeRes.url,
  });

  return completeRes;
}
