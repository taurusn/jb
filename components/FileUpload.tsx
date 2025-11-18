'use client';

import React, { useCallback, useState } from 'react';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '*/*',
  maxSize = 5, // 5MB default
  multiple = false,
  required = false,
  error,
  helperText,
  onChange,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const validateFiles = useCallback(
    (fileList: FileList | File[]): File[] => {
      const validFiles: File[] = [];
      const filesArray = Array.from(fileList);

      for (const file of filesArray) {
        // Check file size
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > maxSize) {
          onError?.(`File "${file.name}" exceeds ${maxSize}MB`);
          continue;
        }

        // Check file type if accept is specified
        if (accept !== '*/*') {
          const acceptedTypes = accept.split(',').map((t) => t.trim());
          const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
          const fileMimeType = file.type;

          const isAccepted = acceptedTypes.some(
            (type) =>
              type === fileMimeType ||
              type === fileExtension ||
              (type.endsWith('/*') && fileMimeType.startsWith(type.replace('/*', '')))
          );

          if (!isAccepted) {
            onError?.(`File "${file.name}" is not an accepted file type`);
            continue;
          }
        }

        validFiles.push(file);
      }

      return validFiles;
    },
    [accept, maxSize, onError]
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const validFiles = validateFiles(fileList);
      
      if (validFiles.length === 0) return;

      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      onChange?.(newFiles);

      // Generate preview URLs for images
      const urls: string[] = [];
      newFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          urls.push(URL.createObjectURL(file));
        }
      });
      setPreviewUrls(urls);
    },
    [files, multiple, onChange, validateFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onChange?.(newFiles);

      // Clean up preview URLs
      if (previewUrls[index]) {
        URL.revokeObjectURL(previewUrls[index]);
      }
      const newUrls = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(newUrls);
    },
    [files, previewUrls, onChange]
  );

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-brand-light mb-2">
          {label}
          {required && <span className="text-brand-yellow ml-1">*</span>}
        </label>
      )}

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-all duration-300 ease-out
          cursor-pointer group
          ${
            isDragging
              ? 'border-brand-yellow bg-brand-yellow/10 scale-105'
              : 'border-dark-300 hover:border-brand-yellow/50 hover:bg-dark-400'
          }
          ${error ? 'border-accent-red' : ''}
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          required={required}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {/* Upload Icon */}
          <div
            className={`
              mb-4 p-4 rounded-full
              transition-all duration-300
              ${
                isDragging
                  ? 'bg-brand-yellow text-brand-dark scale-110'
                  : 'bg-dark-400 text-brand-yellow group-hover:bg-brand-yellow group-hover:text-brand-dark'
              }
            `}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Text */}
          <p className="text-brand-light font-medium mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-400 mb-3">or click to browse</p>
          
          {/* File Info */}
          <p className="text-xs text-gray-500">
            {accept !== '*/*' && `Accepted: ${accept} • `}
            Max size: {maxSize}MB
            {multiple && ' • Multiple files allowed'}
          </p>
        </div>
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p
          className={`mt-1.5 text-sm ${
            error ? 'text-accent-red animate-slide-down' : 'text-gray-400'
          }`}
        >
          {error || helperText}
        </p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-dark-400 rounded-lg border border-dark-300 group hover:border-brand-yellow/50 transition-all duration-300 animate-slide-up"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Preview or Icon */}
                {previewUrls[index] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrls[index]}
                    alt={file.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-dark-300 rounded flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-brand-yellow"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-light truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-2 p-2 text-gray-400 hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all duration-200"
                aria-label="Remove file"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;