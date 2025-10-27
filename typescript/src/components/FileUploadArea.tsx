import React from "react";

interface FileUploadAreaProps {
  selectedFile: File | null;
  uploading: boolean;
  uploadProgress: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploadArea({
  selectedFile,
  uploading,
  uploadProgress,
  onFileChange,
}: FileUploadAreaProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="file-upload"
        className="font-semibold text-[#1B3C7F] text-lg"
      >
        Select a file to upload
      </label>
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#1B3C7F] bg-blue-50 rounded-xl py-8 px-4 transition hover:bg-blue-100 w-full">
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={onFileChange}
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
          style={{ minHeight: "56px" }}
        >
          <span className="text-sm text-gray-500">
            Drag & drop or click to select a file
          </span>
        </label>
        {selectedFile && (
          <div className="mt-3 text-sm text-[#1B3C7F] font-medium text-center w-full break-words">
            {selectedFile.name}
          </div>
        )}
        {uploading && (
          <div className="w-full mt-4">
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#14b38b] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-xs text-center text-[#1B3C7F] mt-1">
              {uploadProgress}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
