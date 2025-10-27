import { useState, useCallback } from "react";
import { uploadFile, type UploadCallbacks, type UploadResult } from "../helpers/upload-flow";

interface UseUploadState {
  uploading: boolean;
  status: string | null;
  progress: number;
  result: UploadResult | null;
  selectedFile: File | null;
}

interface UseUploadActions {
  uploadFile: (file: File, apiKey: string) => Promise<void>;
  setSelectedFile: (file: File | null) => void;
  resetUpload: () => void;
  updateState: (updates: Partial<UseUploadState>) => void;
}

export function useUpload(): UseUploadState & UseUploadActions {
  const [state, setState] = useState<UseUploadState>({
    uploading: false,
    status: null,
    progress: 0,
    result: null,
    selectedFile: null,
  });

  const updateState = useCallback((updates: Partial<UseUploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const callbacks: UploadCallbacks = {
    onStatusChange: (status) => updateState({ status }),
    onProgressChange: (progress) => updateState({ progress }),
    onComplete: (result) => updateState({ result, status: "Upload complete!" }),
    onError: (error) => updateState({ status: `Error: ${error}`, result: null }),
  };

  const handleUpload = useCallback(async (file: File, apiKey: string) => {
    updateState({ uploading: true, progress: 0, result: null });
    
    try {
      await uploadFile(file, apiKey, callbacks);
    } finally {
      updateState({ uploading: false });
    }
  }, [updateState]);

  const setSelectedFile = useCallback((file: File | null) => {
    updateState({ selectedFile: file });
  }, [updateState]);

  const resetUpload = useCallback(() => {
    setState({
      uploading: false,
      status: null,
      progress: 0,
      result: null,
      selectedFile: null,
    });
  }, []);

  return {
    ...state,
    uploadFile: handleUpload,
    setSelectedFile,
    resetUpload,
    updateState,
  };
}
