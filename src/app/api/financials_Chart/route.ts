//Yahoo Finance Proxy API (코스피 시계열 데이터)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'kospi'

  // 지수에 따라 심볼 설정
  const symbolMap: Record<string, string> = {
    kospi: '^KS11',
    kosdaq: '^KQ11',
    kospi200: '^KS200',
  }

  const symbol = symbolMap[type.toLowerCase()] || '^KS11'
  const yahooURL = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`

  try {
    const response = await fetch(yahooURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Yahoo API 요청 실패', status: response.status }),
        { status: 500 }
      )
    }

    const json = await response.json()
    const result = json.chart?.result?.[0]

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      return new Response(JSON.stringify({ error: '응답 데이터 형식 오류' }), { status: 500 })
    }

    const timestamps: number[] = result.timestamp
    const closes: number[] = result.indicators.quote[0].close

    const chartData = timestamps.map((ts, i) => {
      const date = new Date(ts * 1000)
      const time = date.toTimeString().slice(0, 5) // "HH:mm"
      return {
        time,
        value: parseFloat(closes[i]?.toFixed(2)) || null,
      }
    }).filter(d => d.value !== null)

    return new Response(JSON.stringify(chartData), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Yahoo API Error:', err)
    return new Response(JSON.stringify({ error: '서버 오류 발생' }), { status: 500 })
  }
}
