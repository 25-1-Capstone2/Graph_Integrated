
// import { NextResponse } from 'next/server'
// import neo4j from 'neo4j-driver'

// const uri = process.env.NEO4J_URI!
// const user = process.env.NEO4J_USERNAME!
// const password = process.env.NEO4J_PASSWORD!
// const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)
//   const company = searchParams.get('company')

//   if (!company) {
//     return NextResponse.json({ error: 'company 파라미터 누락' }, { status: 400 })
//   }

//   const session = driver.session()

//   try {
//     const codeResult = await session.run(
//       `MATCH (c:Company {name: $company}) RETURN c.code AS code LIMIT 1`,
//       { company }
//     )

//     const codeRecord = codeResult.records[0]
//     if (!codeRecord) {
//       return NextResponse.json({ error: '해당 이름의 회사를 찾을 수 없음' }, { status: 404 })
//     }
//     const code = codeRecord.get('code')

//     const result = await session.run(
//       `
//       MATCH (c:Company {code: $code})-[r:MENTIONS]->(s:Source)
//       WHERE r.count IS NOT NULL AND r.sentiment IS NOT NULL
//       RETURN s.name AS name, r.count AS value, r.sentiment AS sentiment, r.date AS date
//       ORDER BY value DESC
//       LIMIT 50
//       `,
//       { code }
//     )

//     const data = result.records.map((r) => ({
//       year: r.get('year').toNumber(),
//       name: r.get('name'),
//       value: r.get('value')?.toNumber?.() || 0,
//       sentiment: r.get('sentiment') ?? null,
//       date: r.get('date') ?? null
      
//     }))

//     return NextResponse.json({ data })
//   } catch (err) {
//     console.error('❌ Bubble Chart Query Error:', err)
//     return NextResponse.json({ error: 'Query failed' }, { status: 500 })
//   } finally {
//     await session.close()
//   }
// }

import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'

const uri = process.env.NEO4J_URI!
const user = process.env.NEO4J_USERNAME!
const password = process.env.NEO4J_PASSWORD!
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const companyName = searchParams.get('company')

  if (!companyName) {
    return NextResponse.json({ error: 'company 파라미터 누락' }, { status: 400 })
  }

  const session = driver.session()

  try {
    // 회사 코드 조회
    const codeResult = await session.run(
      `MATCH (c:Company {name: $companyName}) RETURN c.code AS code LIMIT 1`,
      { companyName }
    )

    const codeRecord = codeResult.records[0]
    if (!codeRecord) {
      return NextResponse.json({ error: '해당 이름의 회사를 찾을 수 없음' }, { status: 404 })
    }

    const companyCode = codeRecord.get('code')

    // MarketEvent에서 키워드 수집
    const result = await session.run(
      `
      MATCH (m:MarketEvent)
      WHERE m.company_code = $companyCode
      RETURN m.keyword AS keyword, COUNT(*) AS count
      ORDER BY count DESC
      LIMIT 50
      `,
      { companyCode }
    )

    const data = result.records.map((r) => ({
      name: r.get('keyword'),
      value: r.get('count').toNumber(),
    }))

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Bubble Chart Query Error:', err)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  } finally {
    await session.close()
  }
}


