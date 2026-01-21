import { useState, useCallback, useRef } from 'react';
import { FaFile } from 'react-icons/fa';
import { TbTrash } from 'react-icons/tb';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function Dropzone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileClick}
        className={`
          relative group cursor-pointer
          flex flex-col items-center justify-center
          p-10 border-2 border-dashed rounded-2xl
          transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50/10' 
            : 'border-slate-700 hover:border-purple-500 hover:bg-purple-50/5'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
        />
        
        <div className={`
          p-4 rounded-full mb-4
          bg-gradient-to-br from-blue-700 to-purple-700
          text-white shadow-lg group-hover:scale-110 transition-transform duration-300
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          {isDragging ? 'Drop files here' : 'Drop your files or click to upload'}
        </h3>
      </div>

      {files.length > 0 && (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-sm transition-all duration-500 overflow-y-auto max-h-80">
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 5px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #1e293b;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #334155;
            }
          `}</style>
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
            <h4 className="font-medium text-slate-300">Selected Files ({files.length})</h4>
            <button 
              onClick={() => setFiles([])}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wider font-bold"
            >
              Clear All
            </button>
          </div>
          <ul className="divide-y divide-slate-800 custom-scrollbar">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors group">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-700/20 to-purple-700/20 border border-blue-700/30 text-blue-400 shrink-0">
                    <FaFile className='text-slate-300'/>
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium text-slate-200 truncate">{file.name}</span>
                    <span className="flex text-xs text-slate-300 justify-start">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all"
                  aria-label="Remove file"
                >
                 <TbTrash className='text-slate-300'/>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
