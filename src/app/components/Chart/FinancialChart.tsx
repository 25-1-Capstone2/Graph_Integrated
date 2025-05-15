'use client'

import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

type DataPoint = {
  time: string
  value: number
}

interface MarketChartProps {
  data: DataPoint[]
  title: string
}

export default function MarketChart({ data, title }: MarketChartProps) {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!ref.current || data.length < 2) return

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 300
    const margin = { top: 20, right: 30, bottom: 30, left: 50 }

    const startValue = data[0].value

    const x = d3
      .scalePoint()
      .domain(data.map(d => d.time))
      .range([margin.left, width - margin.right])

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, d => d.value)! * 0.998,
        d3.max(data, d => d.value)! * 1.002,
      ])
      .range([height - margin.bottom, margin.top])

    const line = d3.line<DataPoint>()
      .x(d => x(d.time)!)
      .y(d => y(d.value))

    // 기준선
    const 기준Y = y(startValue)
    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', 기준Y)
      .attr('y2', 기준Y)
      .attr('stroke', '#999')
      .attr('stroke-dasharray', '4 2')

    // ✅ 그라디언트 정의
    const yRange = y.range()
    const 기준퍼센트 = ((기준Y - yRange[1]) / (yRange[0] - yRange[1])) * 100

    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'price-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ef4444') // 빨강

    gradient.append('stop')
      .attr('offset', `${기준퍼센트}%`)
      .attr('stop-color', '#ef4444') // 기준선까지 빨강

    gradient.append('stop')
      .attr('offset', `${기준퍼센트}%`)
      .attr('stop-color', '#3b82f6') // 기준선 아래부터 파랑

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6') // 파랑

    // ✅ 선 적용 (gradient stroke)
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#price-gradient)')
      .attr('stroke-width', 2)
      .attr('d', line)

    // X축 - 2시간 간격만 표시
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .tickSizeOuter(0)
          .tickFormat((d: string) =>
            ['09:00', '11:00', '13:00', '15:00'].includes(d) ? d : ''
          )
      )

    // Y축
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))

  }, [data])

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <svg ref={ref} width={600} height={300}></svg>
    </div>
  )
}
