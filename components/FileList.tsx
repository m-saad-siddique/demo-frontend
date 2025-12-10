'use client';

import { useState } from 'react';
import { FileText, Image, File, Download, Trash2, Eye, CheckSquare, Square } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FileListProps {
  files: any[];
  onFileSelect: (file: any) => void;
  onFileDeleted: () => void;
}

export function FileList({ files, onFileSelect, onFileDeleted }: FileListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        onFileDeleted();
        setSelectedFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) return;

    setBatchDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/batch/delete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: Array.from(selectedFiles) }),
        }
      );

      if (response.ok) {
        onFileDeleted();
        setSelectedFiles(new Set());
      }
    } catch (error) {
      console.error('Error batch deleting files:', error);
    } finally {
      setBatchDeleting(false);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const handleDownload = async (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/${file.id}/download`,
      '_blank'
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No files uploaded yet</p>
        <p className="text-sm text-gray-500 mt-2">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Batch Actions */}
      {selectedFiles.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedFiles.size} file(s) selected
          </span>
          <button
            onClick={handleBatchDelete}
            disabled={batchDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            {batchDeleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}

      {/* Select All */}
      <div className="flex items-center space-x-2 mb-2 pb-2 border-b">
        <button
          onClick={toggleSelectAll}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {selectedFiles.size === files.length ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <span className="text-sm text-gray-600">Select All</span>
      </div>

      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onFileSelect(file)}
          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
        >
          <button
            onClick={(e) => toggleSelect(file.id, e)}
            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
          >
            {selectedFiles.has(file.id) ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <div className="flex-shrink-0">{getFileIcon(file.mime_type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.original_filename}
            </p>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => handleDownload(file, e)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDelete(file.id, e)}
              disabled={deletingId === file.id}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete"
            >
              {deletingId === file.id ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

