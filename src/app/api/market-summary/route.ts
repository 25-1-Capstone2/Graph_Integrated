// /api/market-summary/route.ts
import axios from "axios";

const YAHOO_SYMBOLS: { key: string; name: string; symbol: string }[] = [
  { key: "kospi", name: "코스피", symbol: "^KS11" },
  { key: "kosdaq", name: "코스닥", symbol: "^KQ11" },
  { key: "nasdaq", name: "나스닥", symbol: "^IXIC" },
  { key: "usdkrw", name: "달러/원", symbol: "USDKRW=X" },
  { key: "sp500", name: "S&P500", symbol: "^GSPC" },
  { key: "dji", name: "다우존스", symbol: "^DJI" },
  { key: "jpkrw", name: "엔/원", symbol: "JPYKRW=X" },
  { key: "cnykrw", name: "위안/원", symbol: "CNYKRW=X" },
  { key: "eurkrw", name: "유로/원", symbol: "EURKRW=X" },
];

async function fetchYahoo(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const result = res.data.chart.result?.[0];
  const price = result?.meta?.regularMarketPrice;
  const prev = result?.meta?.chartPreviousClose;
  const diff = price - prev;
  const rate = ((diff / prev) * 100).toFixed(2);
  return {
    value: price?.toLocaleString() ?? "-",
    changeValue: (diff > 0 ? "+" : "") + diff.toFixed(2),
    changeRate: (diff > 0 ? "+" : "") + rate + "%",
    isUp: diff >= 0,
  };
}

export async function GET() {
  const data = await Promise.all(
    YAHOO_SYMBOLS.map(async ({ key, name, symbol }) => {
      try {
        const d = await fetchYahoo(symbol);
        return {
          key,
          name,
          value: d.value,
          changeValue: d.changeValue,
          changeRate: d.changeRate,
          isUp: d.isUp,
        };
      } catch {
        return { key, name, value: "-", changeValue: "-", changeRate: "-", isUp: null };
      }
    })
  );
  return new Response(JSON.stringify(data), { status: 200 });
}
