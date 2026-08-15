import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  progress: number;
}

export function FileUpload({
  onFilesSelected,
  accept = '.pdf,.doc,.docx,.txt',
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

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
      const droppedFiles = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      processFiles(droppedFiles);
    },
    [maxFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files).slice(0, maxFiles);
        processFiles(selectedFiles);
      }
    },
    [maxFiles]
  );

  const processFiles = (newFiles: File[]) => {
    const uploadedFiles = newFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
    onFilesSelected?.(newFiles);

    // Simulate upload progress
    uploadedFiles.forEach((file, idx) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name && f.progress < 100
              ? { ...f, progress: Math.min(f.progress + 15, 100) }
              : f
          )
        );
      }, 200 + idx * 100);
      setTimeout(() => clearInterval(interval), 2000);
    });
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? 'rgba(198, 165, 55, 0.6)' : 'rgba(148, 163, 184, 0.2)',
          backgroundColor: isDragging ? 'rgba(198, 165, 55, 0.05)' : 'transparent',
        }}
        className="relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer"
      >
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload-input"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-2xl bg-amber-500/10">
            <Upload className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Drag & drop your files here
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              or click to browse • Supports PDF, DOC, DOCX, TXT
            </p>
          </div>
          <button
            className="mt-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors"
            id="upload-btn"
          >
            Browse Files
          </button>
        </div>
      </motion.div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
            >
              <div className="p-2 rounded-lg bg-amber-500/10">
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatSize(file.size)}
                </p>
                {file.progress < 100 && (
                  <div className="mt-1.5 w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
              {file.progress >= 100 ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
