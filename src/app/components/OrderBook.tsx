'use client';
import React, { useEffect, useState } from "react";

type HogaRow = { price: string; qty: string };
type OrderbookData = {
  stock_code: string;
  sell: HogaRow[];
  buy: HogaRow[];
  sell_total: string;
  buy_total: string;
  acc_vol: string;
};

export default function OrderBook({ code = "005930" }: { code?: string }) {
  const [data, setData] = useState<OrderbookData | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/orderbook?code=${code}`);
    ws.onmessage = (e) => {
      const { type, data } = JSON.parse(e.data);
      if (type === "orderbook") setData(data);
    };
    ws.onerror = (err) => { console.error('WS 오류', err); };
    return () => ws.close();
  }, [code]);

  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <h2>실시간 호가 - {data.stock_code}</h2>
      <table>
        <thead>
          <tr>
            <th>매도호가</th><th>매도잔량</th>
            <th>매수호가</th><th>매수잔량</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
              <td>{data.sell[i]?.price}</td>
              <td>{data.sell[i]?.qty}</td>
              <td>{data.buy[i]?.price}</td>
              <td>{data.buy[i]?.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <b>총매도호가 잔량:</b> {data.sell_total} | <b>총매수호가 잔량:</b> {data.buy_total} | <b>누적거래량:</b> {data.acc_vol}
      </div>
    </div>
  );
}
