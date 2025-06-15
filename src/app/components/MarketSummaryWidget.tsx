"use client";

import React, { useEffect, useState } from "react";
import 'chart.js/auto';
import { Line } from "react-chartjs-2";

type MarketSummary = {
  key: string;
  name: string;
  value: string;
  changeValue: string;
  changeRate: string;
};

type ChartPoint = {
  time: string;
  value: number;
};

const INDEXES = [
  { key: "kospi", label: "코스피" },
  { key: "kosdaq", label: "코스닥" },
  { key: "nasdaq", label: "나스닥" },
  { key: "sp500", label: "S&P500" },
];

const getColor = (changeValue: string) => {
  const v = changeValue.trim();
  if (v.startsWith("+")) return "text-red-500";
  if (v.startsWith("-")) return "text-blue-500";
  return "text-gray-800";
};
const getChartColor = (changeValue: string, key: string) => {
  const v = changeValue.trim();
  if (v.startsWith("+")) return "#ef4444";
  if (v.startsWith("-")) return "#2563eb";
  // 나머지 색상은 원하는 대로 추가 가능
  if (key === "nasdaq") return "#10b981";
  if (key === "usdkrw") return "#6366f1";
  if (key === "sp500") return "#6366f1";
  if (key === "dji") return "#f59e42";
  if (key === "jpkrw") return "#6366f1";
  if (key === "cnykrw") return "#fb7185";
  if (key === "eurkrw") return "#64748b";
  return "#a3a3a3";
};

export default function MarketSummaryWidget() {
  const [summaries, setSummaries] = useState<MarketSummary[]>([]);
  const [selected, setSelected] = useState("kospi");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/market-summary")
      .then(res => res.json())
      .then(data => setSummaries(data))
      .catch(() => setSummaries([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/market-trend?type=${selected}`)
      .then(res => res.json())
      .then(data => setChartData(data))
      .finally(() => setLoading(false));
  }, [selected]);

  const selectedSummary = summaries.find(s => s.key === selected);
  const selectedColor = selectedSummary
    ? getChartColor(selectedSummary.changeValue, selected)
    : "#a3a3a3";
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category" as const,
        grid: { display: false },
        ticks: { font: { size: 13 } }
      },
      y: {
        beginAtZero: false,
        grid: { color: "#eee" },
        ticks: { font: { size: 14 } }
      }
    },
    plugins: { legend: { display: false } }
  };

  const lineData = {
    labels: chartData.map(d => d.time),
    datasets: [
      {
        label: selectedSummary?.name ?? "",
        data: chartData.map(d => d.value),
        borderColor: selectedColor,
        backgroundColor: "rgba(239,68,68,0.05)",
        pointRadius: 0,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="flex w-full items-start py-2 px-1 bg-transparent">
      <div className="flex flex-col gap-3 pr-8 pt-2 min-w-[180px]">
        {INDEXES.map(idx => {
          const s = summaries.find(s => s.key === idx.key);
          const color = s ? getColor(s.changeValue) : "text-gray-800";
          return (
            <button
              key={idx.key}
              className={`
                w-full text-left px-5 py-3 border transition
                ${selected === idx.key
                  ? "border-blue-400 bg-blue-50 font-extrabold"
                  : "border-gray-200 bg-white font-normal"}
                shadow-sm
              `}
              style={{ minHeight: "64px" }}
              onClick={() => setSelected(idx.key)}
            >
              <div className="text-[15px] mb-1">{idx.label}</div>
              {s && (
                <>
                  <div className={`text-[25px] font-bold leading-none mb-0.5 ${color}`}>
                    {s.value}
                  </div>
                  <div className={`text-[13px] font-medium ${color}`}>
                    {s.changeValue.trim()} <span>{s.changeRate.trim()}</span>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-2xl font-bold mb-3">
          {INDEXES.find(idx => idx.key === selected)?.label} 추이
        </div>
        <div className="w-full max-w-[850px] h-[370px]">
          {loading ? (
            <div className="text-blue-400 py-16 text-center text-base">불러오는 중...</div>
          ) : (
            <Line data={lineData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
}
