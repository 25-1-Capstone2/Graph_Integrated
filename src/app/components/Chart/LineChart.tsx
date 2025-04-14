'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type LineChartProps = {
  company: string
}

export default function LineChart({ company }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const fetchDataAndDraw = async () => {
      const res = await fetch(`/api/chart/line?company=${encodeURIComponent(company)}`)
      if (!res.ok) return
      const json = await res.json()
      const data = json.data || []
      if (!data.length) return

      const parsedData = data.map((d: any) => ({
        year: +d.year,
        value: +d.value
      }))

      const svg = d3.select(svgRef.current)
      const container = svgRef.current?.parentElement
      const width = container?.clientWidth || 600
      const height = container?.clientHeight || 300
      const margin = { top: 20, right: 30, bottom: 40, left: 60 }

      svg.selectAll('*').remove()
      svg.attr('width', width).attr('height', height)

      const x = d3
        .scaleLinear()
        .domain(d3.extent(parsedData, (d) => d.year) as [number, number])
        .range([margin.left, width - margin.right])

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(parsedData, (d) => d.value)!])
        .nice()
        .range([height - margin.bottom, margin.top])

      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')))

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))

      svg.append('path')
        .datum(parsedData)
        .attr('fill', 'none')
        .attr('stroke', '#0070f3')
        .attr('stroke-width', 2)
        .attr(
          'd',
          d3.line<any>()
            .x(d => x(d.year))
            .y(d => y(d.value))
        )

      svg.selectAll('circle')
        .data(parsedData)
        .join('circle')
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', '#0070f3')
    }

    fetchDataAndDraw()
  }, [company])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{ marginBottom: '8px' }}>{company} - 연도별 매출액</h3>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
