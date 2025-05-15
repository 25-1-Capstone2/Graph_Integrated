//Yahoo Finance Proxy API (코스피 시계열 데이터)

import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const yahooURL =
      'https://query1.finance.yahoo.com/v8/finance/chart/^KS11?interval=1m&range=1d'

    const response = await fetch(yahooURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Yahoo API 요청 실패', status: response.status }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const json = await response.json()
    const result = json.chart?.result?.[0]

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      return new Response(JSON.stringify({ error: '응답 데이터 형식 오류' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const timestamps: number[] = result.timestamp
    const closes: number[] = result.indicators.quote[0].close

    const chartData = timestamps.map((ts, i) => {
    const date = new Date(ts * 1000)
    const time = date.toTimeString().slice(0, 5)  // ✅ 이렇게 고정 포맷으로 변경

    return {
        time,
        value: parseFloat(closes[i]?.toFixed(2)) || null,
    }
    }).filter(p => p.value !== null)


    return new Response(JSON.stringify(chartData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Yahoo Proxy Error:', err)
    return new Response(JSON.stringify({ error: '예상치 못한 오류 발생' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
