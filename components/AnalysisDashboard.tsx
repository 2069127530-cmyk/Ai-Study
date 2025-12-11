import React from 'react';
import { AnalysisResult } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { CheckCircle, AlertTriangle, BookOpen, TrendingUp, Award, Target } from 'lucide-react';

interface AnalysisDashboardProps {
  data: AnalysisResult;
  onReset: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onReset }) => {
  const scorePercentage = Math.round((data.estimatedScore / (data.totalScore || 100)) * 100);

  // Transform weaknesses for Radar Chart
  const radarData = data.weaknesses.map(w => ({
    subject: w.topic,
    A: w.severity,
    fullMark: 100,
  }));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            {data.subject}学情分析报告
          </h2>
          <p className="text-slate-500 mt-1">{data.summary}</p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={onReset}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
                分析新试卷
            </button>
            <div className="text-right bg-indigo-50 px-6 py-3 rounded-xl">
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">预估得分</p>
                <div className="text-3xl font-bold text-indigo-700">
                    {data.estimatedScore} <span className="text-lg text-indigo-400 font-medium">/ {data.totalScore}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Weakness Visualization */}
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    薄弱点透视
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="薄弱程度"
                                dataKey="A"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fill="#818cf8"
                                fillOpacity={0.4}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={false}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3">
                    {data.weaknesses.slice(0, 3).map((w, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-slate-700 text-sm">{w.topic}</span>
                                <span className="text-xs font-bold text-amber-600">严重度: {w.severity}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${w.severity}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-3 mb-4">
                    <Award className="w-8 h-8 text-indigo-200" />
                    <div>
                        <h3 className="font-bold text-lg">提分潜力</h3>
                        <p className="text-indigo-200 text-sm">基于当前错题分析</p>
                    </div>
                </div>
                <div className="text-4xl font-bold mb-2">+{Math.round((data.totalScore - data.estimatedScore) * 0.6)} <span className="text-xl font-normal text-indigo-200">分</span></div>
                <p className="text-indigo-100 text-sm opacity-90 leading-relaxed">
                    如果攻克上述薄弱知识点，你的预估分数有望得到显著提升。重点关注基础概念的理解。
                </p>
            </div>
        </div>

        {/* Right Column: Detailed Plan & Mistakes */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Improvement Plan */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    个性化提分计划
                </h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                   {data.plan.map((item, index) => (
                       <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 group-hover:bg-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                <Target className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-800">{item.stage}</span>
                                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">{item.focus}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.task}</p>
                            </div>
                       </div>
                   ))}
                </div>
            </div>

             {/* Mistake Analysis */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-500" />
                    错题深度解析
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-4 w-24">题号</th>
                                <th className="p-4 w-32">知识点</th>
                                <th className="p-4">错误原因与解析</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.mistakes.map((mistake, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-800 align-top">{mistake.questionId}</td>
                                    <td className="p-4 align-top">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                            {mistake.topic}
                                        </span>
                                    </td>
                                    <td className="p-4 align-top space-y-1">
                                        <p className="text-red-500 text-xs font-semibold">原因: {mistake.cause}</p>
                                        <p className="text-slate-600 leading-relaxed">{mistake.solution}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
