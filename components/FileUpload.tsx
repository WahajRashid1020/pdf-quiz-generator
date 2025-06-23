import React, { useRef } from 'react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  disabled: boolean;
  currentFileName: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, disabled, currentFileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0] || null;
    if (file && file.type === "application/pdf") {
      onFileChange(file);
    } else {
      // Basic feedback, could be improved with a proper notification
      alert("Please drop a PDF file.");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className={`border-2 border-dashed border-slate-600 rounded-lg p-6 text-center transition-colors duration-150 ease-in-out ${disabled ? 'cursor-not-allowed bg-slate-700' : 'hover:border-sky-500 bg-slate-700/50'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={!disabled ? handleButtonClick : undefined} // Only make clickable if not disabled
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled}
        id="pdf-upload"
      />
      <div className="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mb-3 ${disabled ? 'text-slate-500' : 'text-sky-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className={`text-sm font-medium ${disabled ? 'text-slate-500' : 'text-slate-300'}`}>
          {currentFileName ? `Selected: ${currentFileName}` : 'Click to browse or drag & drop PDF here'}
        </p>
        {!currentFileName && <p className="text-xs text-slate-500 mt-1">Max file size: 10MB (Recommended)</p>}
         {currentFileName && <button 
            type="button" 
            onClick={(e) => { 
                e.stopPropagation(); // Prevent triggering file input click again
                if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
                onFileChange(null);
            }} 
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            disabled={disabled}
          >
            Clear selection
          </button>}
      </div>
    </div>
  );
};
