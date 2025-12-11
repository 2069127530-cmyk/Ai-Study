import React, { useRef, useState } from 'react';
import { Upload, FileImage, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndPass(e.target.files[0]);
    }
    // Clear input value so the same file can be selected again if needed
    e.target.value = '';
  };

  const validateAndPass = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert('请上传图片或PDF文件 (Please upload an image or PDF)');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`
            relative group cursor-pointer
            flex flex-col items-center justify-center 
            w-full h-80 rounded-3xl 
            border-2 border-dashed transition-all duration-300 ease-in-out
            ${isAnalyzing 
                ? 'border-indigo-200 bg-indigo-50/50 cursor-default' 
                : isDragging 
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-xl' 
                    : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50 hover:shadow-lg'
            }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,application/pdf"
          disabled={isAnalyzing}
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center text-center p-6 space-y-4">
          {isAnalyzing ? (
             <div className="flex flex-col items-center animate-pulse">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50"></div>
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mt-6">AI 正在深度分析试卷...</h3>
                <p className="text-slate-500 mt-2">正在识别错题、关联知识点并生成提分计划</p>
             </div>
          ) : (
            <>
              <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                {isDragging ? <FileImage className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800">
                    {isDragging ? '释放以上传' : '点击或拖拽上传试卷'}
                </h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  支持 JPG, PNG, PDF 格式。拍摄清晰的试卷或答题卡照片效果最佳。
                </p>
              </div>
              <div className="pt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    🔒 安全加密传输
                  </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;