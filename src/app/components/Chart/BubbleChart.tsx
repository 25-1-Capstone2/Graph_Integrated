'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type BubbleData = {
  name: string
  value: number
}

type BubbleChartProps = {
  company: string
}

export default function BubbleChart({ company }: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!company) return

    const fetchDataAndRender = async () => {
      const res = await fetch(`/api/chart/bubble?company=${encodeURIComponent(company)}`)
      const json = await res.json()
      const data: BubbleData[] = json.data || []
      if (!data.length) return

      const width = 700
      const height = 500

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', width).attr('height', height)

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      const simulation = d3.forceSimulation<BubbleData>()
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('charge', d3.forceManyBody().strength(5))
        .force('collision', d3.forceCollide().radius(d => d.value * 2))

      const nodes = [...data]

      const node = svg.selectAll('g')
        .data(nodes)
        .enter()
        .append('g')

      node.append('circle')
        .attr('r', d => d.value * 2)
        .attr('fill', (d, i) => colorScale(i.toString()))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)

      node.append('text')
        .text(d => d.name)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('font-size', '10px')
        .style('fill', '#000')

      simulation.nodes(nodes).on('tick', () => {
        node.attr('transform', d => `translate(${d.x},${d.y})`)
      })
    }

    fetchDataAndRender()
  }, [company])

  return (
    <div>
      <h3 style={{ marginBottom: '8px' }}>{company} - 키워드 버블 차트</h3>
      <svg ref={svgRef} style={{ border: '1px solid #ccc', width: '100%' }} />
    </div>
  )
}

