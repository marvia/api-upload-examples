"use client";

import React, { useState } from "react";
import { useUpload } from "../hooks/useUpload";
import { getVariantUrl } from "../helpers/url-helper";
import Header from "../components/Header";
import ApiKeyInput from "../components/ApiKeyInput";
import FileUploadArea from "../components/FileUploadArea";
import UploadButton from "../components/UploadButton";
import StatusDisplay from "../components/StatusDisplay";
import SuccessResult from "../components/SuccessResult";

export default function Home() {
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_API_KEY || "");
  const [showApiKey, setShowApiKey] = useState(false);

  const upload = useUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    upload.setSelectedFile(file);

    if (!apiKey) {
      upload.updateState({ status: "Please enter your API key." });
      return;
    }

    await upload.uploadFile(file, apiKey);
  };

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
              apiKey={apiKey}
              setApiKey={setApiKey}
              showApiKey={showApiKey}
              setShowApiKey={setShowApiKey}
              uploading={upload.uploading}
            />
            <FileUploadArea
              selectedFile={upload.selectedFile}
              uploading={upload.uploading}
              uploadProgress={upload.progress}
              onFileChange={handleFileChange}
            />
            <UploadButton
              uploading={upload.uploading}
              apiKey={apiKey}
              onClick={() => document.getElementById("file-upload")?.click()}
            />
            <StatusDisplay status={upload.status} />
          </div>
        </div>
        <SuccessResult
          uploadResult={upload.result}
          uploading={upload.uploading}
          getVariantUrl={getVariantUrl}
        />
      </main>
    </>
  );
}
