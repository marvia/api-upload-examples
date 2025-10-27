"use client";
import React, { useState } from "react";
import {
  createProgressManager,
  initializeUpload,
  uploadFileParts,
  finalizeUpload,
  type UploadCallbacks,
} from "../helpers/upload-flow";
import { getVariantUrl } from "../helpers/url-helper";
import Header from "../components/Header";
import ApiKeyInput from "../components/ApiKeyInput";
import FileUploadArea from "../components/FileUploadArea";
import UploadButton from "../components/UploadButton";
import StatusDisplay from "../components/StatusDisplay";
import SuccessResult from "../components/SuccessResult";

export default function Home() {
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_API_KEY);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<{
    sysFileUuid: string;
    url: string;
  } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (!apiKey) {
      setStatus("Please enter your API key.");
      return;
    }

    await performUpload(file, apiKey);
  }

  async function performUpload(file: File, apiKey: string) {
    setUploading(true);
    setUploadProgress(0);

    const progressManager = createProgressManager(setUploadProgress);
    const callbacks: UploadCallbacks = {
      setStatus,
      setUploadProgress,
      setUploadResult,
    };

    try {
      // 1. Initialize multipart upload
      const initRes = await initializeUpload(file, apiKey, callbacks);

      // 2. Upload file parts
      const { eTags } = await uploadFileParts(
        file,
        initRes,
        callbacks,
        progressManager
      );

      // 3. Finalize upload
      await finalizeUpload(initRes, eTags, apiKey, callbacks);
    } catch (err: unknown) {
      handleUploadError(err);
    } finally {
      cleanupUpload(progressManager);
    }
  }

  function handleUploadError(err: unknown) {
    if (typeof err === "object" && err && "message" in err) {
      setStatus("Error: " + (err as { message: string }).message);
    } else {
      setStatus("An unknown error occurred.");
    }
    setUploadResult(null);
  }

  function cleanupUpload(
    progressManager: ReturnType<typeof createProgressManager>
  ) {
    setUploading(false);
    progressManager.stop();
    setTimeout(() => setUploadProgress(0), 1500);
  }

  return (
    <>
      <head>
        <title>Marvia API Upload client</title>
      </head>
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Header />
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100">
            <ApiKeyInput
              apiKey={apiKey || ""}
              setApiKey={setApiKey}
              showApiKey={showApiKey}
              setShowApiKey={setShowApiKey}
              uploading={uploading}
            />
            <FileUploadArea
              selectedFile={selectedFile}
              uploading={uploading}
              uploadProgress={uploadProgress}
              onFileChange={handleFileChange}
            />
            <UploadButton
              uploading={uploading}
              apiKey={apiKey || ""}
              onClick={() => document.getElementById("file-upload")?.click()}
            />
            <StatusDisplay status={status} />
          </div>
        </div>
        <SuccessResult
          uploadResult={uploadResult}
          uploading={uploading}
          getVariantUrl={getVariantUrl}
        />
      </main>
    </>
  );
}
