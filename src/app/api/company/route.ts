import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'

const uri = process.env.NEO4J_URI!
const user = process.env.NEO4J_USERNAME!
const password = process.env.NEO4J_PASSWORD!
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

export async function GET() {
  const session = driver.session()
  console.log('🔑 URI:', uri)
  console.log('🔑 USER:', user)
  console.log('🔑 PASS:', password ? '✅ 존재함' : '❌ 없음')
  try {
    const result = await session.run(`
      MATCH (c:Company)
      RETURN c.code AS code, c.name AS name
      ORDER BY c.name ASC
    `)

    const data = result.records.map(r => ({
      code: r.get('code'),
      name: r.get('name'),
    }))

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Company Query Error:', err)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  } finally {
    await session.close()
  }
}
