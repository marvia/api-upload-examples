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

export interface UploadResult {
  sysFileUuid: string;
  url: string;
}

export interface UploadCallbacks {
  onStatusChange: (status: string) => void;
  onProgressChange: (progress: number) => void;
  onComplete: (result: UploadResult) => void;
  onError: (error: string) => void;
}

class ProgressSimulator {
  private interval: NodeJS.Timeout | null = null;

  constructor(private onProgress: (progress: number) => void) {}

  start(target: number, current: number): void {
    this.stop();
    let progress = current;
    this.interval = setInterval(() => {
      if (progress < target) {
        this.onProgress(++progress);
      }
    }, 120);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

export class FileUploader {
  private progressSimulator: ProgressSimulator;

  constructor(private callbacks: UploadCallbacks) {
    this.progressSimulator = new ProgressSimulator(callbacks.onProgressChange);
  }

  async upload(file: File, apiKey: string): Promise<void> {
    try {
      const initRes = await this.initializeUpload(file, apiKey);
      const eTags = await this.uploadParts(file, initRes);
      await this.finalizeUpload(initRes, eTags, apiKey);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.cleanup();
    }
  }

  private async initializeUpload(file: File, apiKey: string): Promise<InitMultipartUploadResponse> {
    this.callbacks.onStatusChange("Initializing multipart upload...");
    
    return await initMultipartUpload({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      apiKey,
    });
  }

  private async uploadParts(file: File, initRes: InitMultipartUploadResponse): Promise<string[]> {
    this.callbacks.onStatusChange("Splitting file and uploading parts...");
    
    const parts = splitFile(file, initRes.numberOfParts);
    const eTags: string[] = [];

    for (const [index, part] of parts.entries()) {
      const eTag = await this.uploadSinglePart(part, initRes.parts[index], index + 1, parts.length);
      eTags.push(eTag ?? "");
    }

    return eTags;
  }

  private async uploadSinglePart(part: Blob, partInfo: { url: string }, current: number, total: number): Promise<string | null> {
    this.callbacks.onStatusChange(`Uploading part ${current} of ${total}...`);
    
    const progressStart = Math.round(((current - 1) / total) * 100);
    const progressTarget = Math.round((current / total) * 100);
    
    this.progressSimulator.start(progressTarget, progressStart);
    const eTag = await uploadPart(partInfo.url, part);
    this.progressSimulator.stop();
    this.callbacks.onProgressChange(progressTarget);
    
    return eTag || null;
  }

  private async finalizeUpload(initRes: InitMultipartUploadResponse, eTags: string[], apiKey: string): Promise<void> {
    this.callbacks.onStatusChange("Finalizing upload...");

    const completeRes = await completeMultipartUpload({
      uuid: initRes.uuid,
      parts: initRes.parts.map((part, idx) => ({
        partNumber: part.partNumber,
        eTag: eTags[idx],
      })),
      apiKey,
    });

    this.callbacks.onStatusChange("Upload complete!");
    this.callbacks.onProgressChange(100);
    this.callbacks.onComplete({
      sysFileUuid: completeRes.fileUuid,
      url: completeRes.url,
    });
  }

  private handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    this.callbacks.onError(message);
  }

  private cleanup(): void {
    this.progressSimulator.stop();
    setTimeout(() => this.callbacks.onProgressChange(0), 1500);
  }
}

export async function uploadFile(file: File, apiKey: string, callbacks: UploadCallbacks): Promise<void> {
  const uploader = new FileUploader(callbacks);
  await uploader.upload(file, apiKey);
}
