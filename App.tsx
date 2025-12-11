import React, { useState, useCallback } from 'react';
import { BrainCircuit, Sparkles, Layout } from 'lucide-react';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import { analyzeExamPaper } from './services/geminiService';
import { AppState, AnalysisResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File) => {
    setAppState('analyzing');
    setErrorMessage('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Content = base64String.split(',')[1];
        
        try {
            const result = await analyzeExamPaper(base64Content, file.type);
            setAnalysisResult(result);
            setAppState('success');
        } catch (error: any) {
            console.error("Analysis Failed:", error);
            
            let msg = "AI分析服务暂时不可用或无法识别该图片，请重试。";
            
            if (error instanceof Error) {
                // Provide more specific feedback based on the error
                if (error.message.includes("API Key")) {
                    msg = "配置错误：未检测到 API Key。请在 Vercel 环境变量中设置 'API_KEY' 并重新部署。";
                } else if (error.message.includes("403")) {
                    msg = "权限错误：API Key 无效或配额已用完 (403 Forbidden)。";
                } else if (error.message.includes("429")) {
                    msg = "请求过多：请稍后再试 (429 Too Many Requests)。";
                } else if (error.message.includes("503") || error.message.includes("500")) {
                     msg = "服务繁忙：Google AI 服务暂时不可用，请稍后重试。";
                } else {
                     msg = `分析失败: ${error.message}`;
                }
            }
            
            setErrorMessage(msg);
            setAppState('error');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrorMessage("文件读取失败");
      setAppState('error');
    }
  }, []);

  const handleReset = () => {
    setAppState('idle');
    setAnalysisResult(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                智学AI
              </span>
            </div>
            <div className="flex items-center gap-4">
                <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">使用帮助</a>
                <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200">
                    个人中心
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {appState === 'idle' || appState === 'analyzing' || appState === 'error' ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
            <div className="text-center space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                <span>基于 Gemini 2.5 Flash 视觉模型</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                智能诊断，<br className="md:hidden"/>
                <span className="text-indigo-600">科学提分</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
                只需上传试卷照片，AI 即可精准分析错题原因，构建您的专属知识图谱，并定制个性化学习计划。
              </p>
            </div>

            <div className="w-full">
                <FileUpload onFileSelect={handleFileSelect} isAnalyzing={appState === 'analyzing'} />
            </div>

            {appState === 'error' && (
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 flex items-center gap-3 max-w-lg animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                    <p className="text-sm font-medium">{errorMessage}</p>
                </div>
            )}
            
            {/* Features Grid (Only show when idle for better aesthetics) */}
            {appState === 'idle' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12 opacity-80">
                    {[
                        { title: '错题自动识别', desc: 'OCR 精准提取手写或打印体' },
                        { title: '知识点溯源', desc: '构建学科知识图谱，定位薄弱环' },
                        { title: '个性化规划', desc: '基于遗忘曲线定制复习日程' }
                    ].map((feature, i) => (
                        <div key={i} className="flex flex-col items-center text-center p-4">
                            <h3 className="font-bold text-slate-700 mb-1">{feature.title}</h3>
                            <p className="text-sm text-slate-500">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            )}
          </div>
        ) : (
            analysisResult && <AnalysisDashboard data={analysisResult} onReset={handleReset} />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} 智学AI (WiseStudy). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;