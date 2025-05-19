import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const companyName = searchParams.get('company')

  if (!companyName) {
    return NextResponse.json({ error: 'company 파라미터 누락' }, { status: 400 })
  }

  const session = driver.session()

  try {
    const result = await session.run(
      `
      MATCH (c:Company {name: $companyName})-[:HAS_STATEMENT]->(fs:FinancialStatement)
      WHERE fs.item = '매출액' AND fs.amount IS NOT NULL
      RETURN toInteger(fs.year) AS year, avg(toFloat(fs.amount)) AS value
      ORDER BY year ASC
      `,
      { companyName }
    )
    console.log('Neo4j Raw Result:', result.records);
    const data = result.records.map((r) => {
  const year = r.get('year');
  const value = r.get('value');
  return {
    year: neo4j.isInt(year) ? year.toNumber() : year,
    value: neo4j.isInt(value) ? value.toNumber() : value
  };
});

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ LineChart Query Error:', err)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  } finally {
    await session.close()
  }
}

