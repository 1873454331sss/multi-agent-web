"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type AnalysisResult = {
  query: string;
  report: string;
  status: Record<string, string>;
  data: {
    articles: any[];
    sentiment: { label?: string; score?: number };
    competitors: string[];
    risks: string[];
    risk_level: string;
  };
};

type HistoryRecord = {
  id: number;
  query: string;
  report: string;
  sentiment_label: string;
  risk_level: string;
  created_at: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError("请输入关键词");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`请求失败：${res.status}`);
      const data = await res.json();
      setResult(data);
      loadHistory();
    } catch (e: any) {
      setError(e.message || "分析失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history?limit=10`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.records || []);
    } catch {
      // 历史记录加载失败不影响主流程
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          多 Agent 舆情分析
        </h1>
        <p className="text-gray-600 mb-8">
          输入关键词，自动生成带情感分析和风险预警的舆情报告
        </p>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="比如：小米、华为、特斯拉"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "分析中..." : "开始分析"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">分析报告</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
              {result.report}
            </pre>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">历史记录</h2>
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{h.query}</span>
                    <span className="text-gray-500">
                      {h.sentiment_label} / {h.risk_level}
                    </span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-blue-600 text-sm cursor-pointer">
                      查看报告
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700 font-sans bg-gray-50 p-3 rounded">
                      {h.report}
                    </pre>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}