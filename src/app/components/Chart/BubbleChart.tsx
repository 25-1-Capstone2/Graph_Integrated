'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type BubbleChartProps = {
  company: string
}

type Data = {
  name: string
  value: number
}

export default function BubbleChart({ company }: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const fetchDataAndDraw = async () => {
      const res = await fetch(`/api/chart/bubble?company=${encodeURIComponent(company)}`)
      const json = await res.json()
      const data: Data[] = json.data || []

      console.log('📦 Bubble Data:', data)

      if (!data.length) return

      const width = 600
      const height = 400

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      const root = d3
        .pack()
        .size([width, height])
        .padding(5)(
          d3
            .hierarchy({ children: data } as any)
            .sum((d: any) =>
              typeof d.value === 'number' && !isNaN(d.value) && d.value > 0
                ? d.value
                : 1
            )
        )

      const color = d3.scaleOrdinal(d3.schemeSet3)

      const node = svg
        .attr('width', width)
        .attr('height', height)
        .selectAll('g')
        .data(root.leaves())
        .join('g')
        .attr('transform', (d) => `translate(${d.x},${d.y})`)

      node
        .append('circle')
        .attr('r', (d) => d.r)
        .attr('fill', (_, i) => color(String(i)))

      node
        .append('text')
        .text((d) => (d.data as Data).name)
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .style('font-size', (d) => `${Math.min(d.r / 3, 14)}px`)
        .style('fill', '#fff')
    }

    fetchDataAndDraw()
  }, [company])

  return (
    <div style={{ padding: '20px' }}>
      <h3>{company} 관련 키워드</h3>
      <svg ref={svgRef}></svg>
    </div>
  )
}
