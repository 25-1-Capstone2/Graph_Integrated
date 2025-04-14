// src/app/api/chart/line/route.ts
import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'

const uri = process.env.NEO4J_URI!
const user = process.env.NEO4J_USERNAME!
const password = process.env.NEO4J_PASSWORD!
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const company = searchParams.get('company')

  if (!company) {
    return NextResponse.json({ error: 'company 파라미터 누락' }, { status: 400 })
  }

  const session = driver.session()

  try {
    const codeResult = await session.run(
      `MATCH (c:Company {name: $company}) RETURN c.code AS code LIMIT 1`,
      { company }
    )
    const codeRecord = codeResult.records[0]
    if (!codeRecord) {
      return NextResponse.json({ error: '해당 이름의 회사를 찾을 수 없음' }, { status: 404 })
    }
    const code = codeRecord.get('code')

    const result = await session.run(
        `
        MATCH (f:FinancialItem {company: $code})
        WHERE f.value IS NOT NULL
        RETURN f.year AS year, f.name AS name, toFloat(f.value) AS value
        ORDER BY f.year ASC, f.name ASC
        `,
        { code }
      )
      

    const data = result.records.map((r) => ({
      year: r.get('year'),
      name: r.get('name'),
      value: r.get('value'),
    }))

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Line Chart Query Error:', err)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  } finally {
    await session.close()
  }
}