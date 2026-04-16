
import React, { useState, useRef, useCallback } from 'react';
import UploadIcon from './icons/UploadIcon';

interface BillUploaderProps {
  onProcessBill: (file: File) => void;
  disabled: boolean;
}

const BillUploader: React.FC<BillUploaderProps> = ({ onProcessBill, disabled }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleProcessClick = () => {
    if (selectedFile) {
      onProcessBill(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        onClick={triggerFileSelect}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={disabled}
        />
        {previewUrl ? (
          <div className="flex flex-col items-center">
            <img src={previewUrl} alt="Bill preview" className="max-h-48 w-auto rounded-md object-contain" />
            <p className="mt-2 text-sm text-gray-600 font-medium truncate max-w-full px-4">{selectedFile?.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center text-gray-500">
            <UploadIcon className="w-12 h-12 mb-3 text-gray-400" />
            <p className="font-semibold text-gray-600">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, or WEBP</p>
          </div>
        )}
      </div>
      <button
        onClick={handleProcessClick}
        disabled={!selectedFile || disabled}
        className="mt-6 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Analyze Bill
      </button>
    </div>
  );
};

export default BillUploader;
