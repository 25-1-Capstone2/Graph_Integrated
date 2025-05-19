'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type NodeDatum = d3.SimulationNodeDatum & {
  id: string
  label: string
}

type LinkDatum = d3.SimulationLinkDatum<NodeDatum> & {
  source: string
  target: string
  label: string
}

type GraphData = {
  nodes: NodeDatum[]
  links: LinkDatum[]
}

export default function OntologyGraph({ company }: { company: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const fetchAndDraw = async () => {
      const res = await fetch(`/api/ontology?company=${encodeURIComponent(company)}`)
      const data: GraphData = await res.json()

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      const width = 600
      const height = 400

      const simulation = d3
        .forceSimulation<NodeDatum>(data.nodes)
        .force(
          'link',
          d3
            .forceLink<NodeDatum, LinkDatum>(data.links)
            .id((d) => d.id)
            .distance(120)
        )
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))

      const link = svg
        .append('g')
        .selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 1.5)

      const node = svg
        .append('g')
        .selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', 10)
        .attr('fill', 'steelblue')
        .call(
          d3
            .drag<SVGCircleElement, NodeDatum>()
            .on('start', (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart()
              d.fx = d.x
              d.fy = d.y
            })
            .on('drag', (event, d) => {
              d.fx = event.x
              d.fy = event.y
            })
            .on('end', (event, d) => {
              if (!event.active) simulation.alphaTarget(0)
              d.fx = null
              d.fy = null
            })
        )

      const text = svg
        .append('g')
        .selectAll('text')
        .data(data.nodes)
        .enter()
        .append('text')
        .text(d => d.id)
        .attr('font-size', 10)
        .attr('dy', -15)

      simulation.on('tick', () => {
        link
          .attr('x1', d => (d.source as NodeDatum).x!)
          .attr('y1', d => (d.source as NodeDatum).y!)
          .attr('x2', d => (d.target as NodeDatum).x!)
          .attr('y2', d => (d.target as NodeDatum).y!)

        node.attr('cx', d => d.x!).attr('cy', d => d.y!)
        text.attr('x', d => d.x!).attr('y', d => d.y!)
      })
    }

    fetchAndDraw()
  }, [company])

  return <svg ref={svgRef} width={600} height={400}></svg>
}

