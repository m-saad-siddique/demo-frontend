'use client';

import { useState } from 'react';
import { Minimize2, Maximize2, Crop, FileText, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileToolsProps {
  file: any;
}

export function FileTools({ file }: FileToolsProps) {
  const [compressing, setCompressing] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [compressQuality, setCompressQuality] = useState('80');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [cropX, setCropX] = useState('');
  const [cropY, setCropY] = useState('');
  const [cropWidth, setCropWidth] = useState('');
  const [cropHeight, setCropHeight] = useState('');
  const [copied, setCopied] = useState(false);

  const isImage = file?.mime_type?.startsWith('image/');
  const isPDF = file?.mime_type === 'application/pdf';

  const handleCompress = async () => {
    if (!isImage) return;
    setCompressing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/${file.id}/compress`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quality: parseInt(compressQuality) }),
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_${file.original_filename}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Compression error:', error);
    } finally {
      setCompressing(false);
    }
  };

  const handleResize = async () => {
    if (!isImage) return;
    setResizing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/${file.id}/resize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            width: resizeWidth ? parseInt(resizeWidth) : undefined,
            height: resizeHeight ? parseInt(resizeHeight) : undefined,
            fit: 'inside',
          }),
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resized_${file.original_filename}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Resize error:', error);
    } finally {
      setResizing(false);
    }
  };

  const handleCrop = async () => {
    if (!isImage) return;
    setCropping(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/${file.id}/crop`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            x: parseInt(cropX),
            y: parseInt(cropY),
            width: parseInt(cropWidth),
            height: parseInt(cropHeight),
          }),
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropped_${file.original_filename}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Crop error:', error);
    } finally {
      setCropping(false);
    }
  };

  const handleExtractText = async () => {
    if (!isPDF) return;
    setExtracting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/files/${file.id}/extract-text`
      );
      const data = await response.json();
      if (data.success) {
        setExtractedText(data.data.text);
      }
    } catch (error) {
      console.error('Extract error:', error);
    } finally {
      setExtracting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Image Compression */}
      {isImage && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Minimize2 className="w-4 h-4 mr-2" />
            Compress Image
          </h4>
          <div className="space-y-2">
            <div>
              <label className="text-sm text-gray-600">Quality (1-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={compressQuality}
                onChange={(e) => setCompressQuality(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={handleCompress}
              disabled={compressing}
              className={cn(
                'w-full py-2 px-4 rounded-lg font-medium',
                compressing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {compressing ? 'Compressing...' : 'Compress & Download'}
            </button>
          </div>
        </div>
      )}

      {/* Image Resize */}
      {isImage && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Maximize2 className="w-4 h-4 mr-2" />
            Resize Image
          </h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-sm text-gray-600">Width (px)</label>
              <input
                type="number"
                value={resizeWidth}
                onChange={(e) => setResizeWidth(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Height (px)</label>
              <input
                type="number"
                value={resizeHeight}
                onChange={(e) => setResizeHeight(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={handleResize}
            disabled={resizing}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium',
              resizing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            )}
          >
            {resizing ? 'Resizing...' : 'Resize & Download'}
          </button>
        </div>
      )}

      {/* Image Crop */}
      {isImage && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Crop className="w-4 h-4 mr-2" />
            Crop Image
          </h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-sm text-gray-600">X</label>
              <input
                type="number"
                value={cropX}
                onChange={(e) => setCropX(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Y</label>
              <input
                type="number"
                value={cropY}
                onChange={(e) => setCropY(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Width</label>
              <input
                type="number"
                value={cropWidth}
                onChange={(e) => setCropWidth(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Height</label>
              <input
                type="number"
                value={cropHeight}
                onChange={(e) => setCropHeight(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={handleCrop}
            disabled={cropping}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium',
              cropping
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            )}
          >
            {cropping ? 'Cropping...' : 'Crop & Download'}
          </button>
        </div>
      )}

      {/* PDF Text Extraction */}
      {isPDF && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Extract Text from PDF
          </h4>
          <button
            onClick={handleExtractText}
            disabled={extracting}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium mb-3',
              extracting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            )}
          >
            {extracting ? 'Extracting...' : 'Extract Text'}
          </button>
          {extractedText && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Extracted Text:</span>
                <button
                  onClick={copyToClipboard}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={extractedText}
                className="w-full h-40 px-3 py-2 border rounded-lg text-sm font-mono"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

