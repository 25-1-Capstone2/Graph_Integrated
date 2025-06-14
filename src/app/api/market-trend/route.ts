// /api/market-trend/route.ts
import { NextRequest } from 'next/server';

const YAHOO_MAP: Record<string, { symbol: string; name: string }> = {
  kospi: { symbol: "^KS11", name: "코스피" },
  kosdaq: { symbol: "^KQ11", name: "코스닥" },
  nasdaq: { symbol: "^IXIC", name: "나스닥" },
  usdkrw: { symbol: "USDKRW=X", name: "달러/원" },
  sp500: { symbol: "^GSPC", name: "S&P500" },
  dji: { symbol: "^DJI", name: "다우존스" },
  jpkrw: { symbol: "JPYKRW=X", name: "엔/원" },
  cnykrw: { symbol: "CNYKRW=X", name: "위안/원" },
  eurkrw: { symbol: "EURKRW=X", name: "유로/원" },
};

// GET: ?type=kospi|kosdaq|nasdaq|usdkrw|sp500|dji|jpkrw|cnykrw|eurkrw
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'kospi';
  const item = YAHOO_MAP[type.toLowerCase()] || YAHOO_MAP.kospi;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${item.symbol}?interval=1m&range=1d`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!response.ok) throw new Error("Yahoo API 요청 실패");
    const json = await response.json();
    const result = json.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    const timestamps: number[] = result.timestamp;
    const closes: number[] = result.indicators.quote[0].close;
    const chartData = timestamps.map((ts, i) => {
      const date = new Date(ts * 1000);
      const time = date.toTimeString().slice(0, 5); // HH:mm
      return {
        time,
        value: parseFloat(closes[i]?.toFixed(2)) || null,
      };
    }).filter(d => d.value !== null);

    return new Response(JSON.stringify(chartData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
