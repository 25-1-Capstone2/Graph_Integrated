export const runtime = 'nodejs'  // ← 로그 찍히게 전환

import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'

const uri = process.env.NEO4J_URI!
const user = process.env.NEO4J_USERNAME!
const password = process.env.NEO4J_PASSWORD!

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

export async function GET() {
  console.log('🔥 Financial API 진입')

  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (s:FinancialStatement {company: "084680"})
      RETURN s.item AS item, s.amount AS amount, s.year AS year
      ORDER BY s.year ASC, s.item ASC
    `)

    const data = result.records.map(r => ({
      item: r.get('item'),
      amount: typeof r.get('amount') === 'object' && r.get('amount')?.toNumber
      ? r.get('amount')?.toNumber()
      : parseFloat(r.get('amount')),

      year: r.get('year')?.toNumber?.()
    }))

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ FinancialStatement Query Error:', err)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  } finally {
    await session.close()
  }
}
