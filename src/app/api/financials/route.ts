// 네이버 금융 지수 크롤링 API

import axios from 'axios'
import * as cheerio from 'cheerio'
import iconv from 'iconv-lite'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { data: buffer } = await axios.get('https://finance.naver.com/sise/', {
      responseType: 'arraybuffer',
    })

    const html = iconv.decode(buffer, 'EUC-KR')
    const $ = cheerio.load(html)

    const kospi = $('#KOSPI_now').text().trim()
    const kospiChange = $('#KOSPI_change').text().trim()
    const kosdaq = $('#KOSDAQ_now').text().trim()
    const kosdaqChange = $('#KOSDAQ_change').text().trim()

    const data = [
      { name: '코스피', value: kospi, change: kospiChange },
      { name: '코스닥', value: kosdaq, change: kosdaqChange },
    ]

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('네이버 크롤링 실패:', err)
    return new Response(JSON.stringify({ error: '크롤링 실패' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
