import { Dispatch, SetStateAction } from "react";

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (value: string) => void;
  showApiKey: boolean;
  setShowApiKey: Dispatch<SetStateAction<boolean>>;
  uploading: boolean;
}

export default function ApiKeyInput({
  apiKey,
  setApiKey,
  showApiKey,
  setShowApiKey,
  uploading,
}: ApiKeyInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="api-key" className="font-semibold text-[#1B3C7F]">
        API Key
      </label>
      <div className="relative">
        <input
          id="api-key"
          type={showApiKey ? "text" : "password"}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B3C7F] bg-gray-50 w-full pr-10"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          disabled={uploading}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#1B3C7F] font-semibold focus:outline-none"
          onClick={() => setShowApiKey((v) => !v)}
          tabIndex={-1}
        >
          {showApiKey ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
