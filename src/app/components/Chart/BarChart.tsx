'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type BarChartProps = {
  company: string
}

type ChartData = {
  year: string
  name: string
  value: number
}

export default function BarChart({ company }: BarChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!company) return

    const fetchDataAndRender = async () => {
      const res = await fetch(`/api/chart/bar?company=${encodeURIComponent(company)}`)
      const json = await res.json()
      const data: ChartData[] = json.data || []

      // Group data by year
      const grouped = d3.group(data, d => d.year)

      const margin = { top: 20, right: 30, bottom: 40, left: 60 }
      const width = 600
      const height = 400

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', width).attr('height', height)

      const x0 = d3.scaleBand()
        .domain(Array.from(grouped.keys()))
        .rangeRound([margin.left, width - margin.right])
        .paddingInner(0.1)

      const allNames = Array.from(new Set(data.map(d => d.name)))
      const x1 = d3.scaleBand()
        .domain(allNames)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05)

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.value)! * 1.1])
        .rangeRound([height - margin.bottom, margin.top])

      const color = d3.scaleOrdinal()
        .domain(allNames)
        .range(d3.schemeCategory10)
      // Legend 영역
      const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 120}, ${margin.top})`) // 위치 조정

      allNames.forEach((name, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`)

      legendRow.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', color(name)!)

      legendRow.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .attr('text-anchor', 'start')
        .style('font-size', '12px')
        .text(name)
      })

      svg.append('g')
        .selectAll('g')
        .data(Array.from(grouped.entries()))
        .join('g')
        .attr('transform', d => `translate(${x0(d[0])},0)`)
        .selectAll('rect')
        .data(d => d[1])
        .join('rect')
        .attr('x', d => x1(d.name)!)
        .attr('y', d => y(+d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => y(0) - y(+d.value))
        .attr('fill', d => color(d.name)!)

      // X-axis
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0))

      // Y-axis
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, 's'))

      // Title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(`${company} 주요 재무 지표`)
    }

    fetchDataAndRender()
  }, [company])

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  )
}
