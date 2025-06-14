import axios from "axios";

type MarketItem = {
  key: string;
  name: string;
  symbol: string;
};

const ITEMS: MarketItem[] = [
  { key: "kospi",   name: "코스피",   symbol: "^KS11" },
  { key: "kosdaq",  name: "코스닥",  symbol: "^KQ11" },
  { key: "nasdaq",  name: "나스닥",  symbol: "^IXIC" },
  { key: "usdkrw",  name: "달러/원", symbol: "KRW=X" }
];

async function fetchYahoo(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const result = res.data.chart.result?.[0];
  const price = result?.meta?.regularMarketPrice;
  const prev = result?.meta?.chartPreviousClose;
  const diff = price - prev;
  const rate = ((diff / prev) * 100);
  return {
    value: price?.toLocaleString() ?? "-",
    changeValue: (diff > 0 ? "+" : "") + diff.toFixed(2),
    changeRate: (diff > 0 ? "+" : "") + rate.toFixed(2) + "%",
    isUp: diff >= 0
  }
}

export async function GET() {
  // 4개 모두 야후에서 fetch
  const result = await Promise.all(ITEMS.map(async (item) => {
    try {
      const data = await fetchYahoo(item.symbol);
      return {
        key: item.key,
        name: item.name,
        value: data.value,
        changeValue: data.changeValue,
        changeRate: data.changeRate,
        isUp: data.isUp
      };
    } catch (e) {
      return {
        key: item.key,
        name: item.name,
        value: "-",
        changeValue: "0",
        changeRate: "0%",
        isUp: true
      };
    }
  }));

  return new Response(JSON.stringify(result), { status: 200 });
}
