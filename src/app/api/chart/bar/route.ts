// import { NextResponse } from 'next/server'
// import neo4j from 'neo4j-driver'

// const driver = neo4j.driver(
//   process.env.NEO4J_URI!,
//   neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
// )

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url)
//   const company = searchParams.get('company')

//   const session = driver.session()
//   try {
//     const result = await session.run(`
//       MATCH (f:FinancialItem)
//       WHERE f.company = $company AND f.name IN ['매출액', '영업이익', '당기순이익']
//       RETURN f.year AS year, f.name AS name, toFloat(f.value) AS value
//       ORDER BY f.year ASC, f.name ASC
//     `, { company })

//     const data = result.records.map(r => ({
//       year: r.get('year'),
//       name: r.get('name'),
//       value: r.get('value'),
//     }))

//     return NextResponse.json({ data })
//   } catch (err) {
//     console.error('❌ BarChart Query Error:', err)
//     return NextResponse.json({ error: 'Query failed' }, { status: 500 })
//   } finally {
//     await session.close()
//   }
// }

import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const companyName = searchParams.get('company')

  const session = driver.session()
  try {
    const result = await session.run(
      `
      MATCH (c:Company {name: $companyName})-[:HAS_STATEMENT]->(fs:FinancialStatement)
      WHERE fs.item IN ['매출액', '영업이익', '당기순이익']
      RETURN fs.year AS year, fs.item AS name, toFloat(fs.amount) AS value
      ORDER BY fs.year ASC, fs.item ASC
      `,
      { companyName }
    )

    const data = result.records.map((r) => ({
  year: r.get('year').toNumber(),             // Neo4j Integer → number
  name: r.get('name'),
  value: r.get('value').toNumber?.() ?? r.get('value'), // 안전하게 처리
}))


    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ BarChart Query Error:', err)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  } finally {
    await session.close()
  }
}
