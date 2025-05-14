import axios from 'axios'
import * as cheerio from 'cheerio'
import iconv from 'iconv-lite'

export async function GET() {
  try {
    const res = await axios.get('https://finance.naver.com/sise/', {
      responseType: 'arraybuffer', // 중요
    })

    const decoded = iconv.decode(res.data, 'EUC-KR') // 한글 디코딩
    const $ = cheerio.load(decoded)

    const kospi = $('#KOSPI_now').text().trim()
    const kospiChange = $('#KOSPI_change').text().trim()
    const kosdaq = $('#KOSDAQ_now').text().trim()
    const kosdaqChange = $('#KOSDAQ_change').text().trim()

    const items = [
      { name: '코스피', value: kospi, change: kospiChange },
      { name: '코스닥', value: kosdaq, change: kosdaqChange },
    ]

    return Response.json(items)
  } catch (err) {
    console.error('네이버 크롤링 실패:', err)
    return Response.json({ error: '크롤링 실패' }, { status: 500 })
  }
}
