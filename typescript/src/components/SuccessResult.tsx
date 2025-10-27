interface SuccessResultProps {
  uploadResult: {
    sysFileUuid: string;
    url: string;
  } | null;
  uploading: boolean;
  getVariantUrl: (baseUrl: string, prefix: string) => string;
}

export default function SuccessResult({
  uploadResult,
  uploading,
  getVariantUrl,
}: SuccessResultProps) {
  if (!uploadResult || uploading) return null;

  const previewUrl = getVariantUrl(uploadResult.url, "preview_");
  const thumbnailUrl = getVariantUrl(uploadResult.url, "thumbnail_");

  return (
    <div className="w-full max-w-md mt-8 mx-auto">
      <div className="bg-green-50 border border-green-200 rounded-xl shadow p-6 flex flex-col gap-3 items-center">
        <div className="flex items-center gap-2 text-green-700 font-semibold text-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-green-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          Upload Successful
        </div>
        <div className="w-full text-sm text-gray-700">
          <div className="mb-1 font-medium">File UUID:</div>
          <div className="break-all bg-white rounded px-2 py-1 border border-gray-200">
            {uploadResult.sysFileUuid}
          </div>
        </div>
        <div className="w-full text-sm text-gray-700">
          <div className="mb-1 font-medium">Original URL:</div>
          <a
            href={uploadResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all bg-white rounded px-2 py-1 border border-gray-200 text-blue-700 hover:underline"
          >
            {uploadResult.url}
          </a>
        </div>
        {previewUrl && (
          <div className="w-full text-sm text-gray-700">
            <div className="mb-1 font-medium">Preview URL:</div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all bg-white rounded px-2 py-1 border border-gray-200 text-blue-700 hover:underline"
            >
              {previewUrl}
            </a>
          </div>
        )}
        {thumbnailUrl && (
          <div className="w-full text-sm text-gray-700">
            <div className="mb-1 font-medium">Thumbnail URL:</div>
            <a
              href={thumbnailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all bg-white rounded px-2 py-1 border border-gray-200 text-blue-700 hover:underline"
            >
              {thumbnailUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
