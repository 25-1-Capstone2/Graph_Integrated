// /pages/api/graph.ts (또는 /app/api/graph/route.ts if using App Router)
import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
)

export default async function handler(req: any, res: any) {
  const session = driver.session()
  const { company } = req.query

  try {
    const result = await session.run(
      `
      MATCH (c:Company {name: $name})-[r]->(n)
      RETURN c, r, n
      `,
      { name: company }
    )

    const nodes: any[] = []
    const links: any[] = []

    result.records.forEach(record => {
      const source = record.get('c').properties
      const target = record.get('n').properties
      const rel = record.get('r')

      // Add source node
      if (!nodes.find(n => n.id === source.name)) {
        nodes.push({ id: source.name, label: 'Company' })
      }

      // Add target node
      if (!nodes.find(n => n.id === target.item || target.name || target.title)) {
        nodes.push({
          id: target.item || target.name || target.title,
          label: target.item ? 'FinancialStatement' : target.title ? 'News' : 'Other',
        })
      }

      // Add link
      links.push({
        source: source.name,
        target: target.item || target.name || target.title,
        label: rel.type,
      })
    })

    res.status(200).json({ nodes, links })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Neo4j error' })
  } finally {
    await session.close()
  }
}
