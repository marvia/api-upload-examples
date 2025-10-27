interface UploadButtonProps {
  uploading: boolean;
  apiKey: string;
  onClick: () => void;
}

export default function UploadButton({
  uploading,
  apiKey,
  onClick,
}: UploadButtonProps) {
  return (
    <button
      className="mt-4 w-full py-2 rounded-lg font-semibold text-white bg-[#14b38b] hover:bg-[#14b38b] transition disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={uploading || !apiKey}
      onClick={onClick}
      type="button"
    >
      {uploading ? "Uploading..." : "Start Upload"}
    </button>
  );
}
