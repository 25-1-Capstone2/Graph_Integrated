import * as React from "react"

// Card 컴포넌트
export function Card({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow ${className}`}
      {...props}
    />
  )
}

// CardHeader 컴포넌트
export function CardHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-b px-6 py-4 ${className}`}
      {...props}
    />
  )
}

// CardTitle 컴포넌트
export function CardTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold ${className}`}
      {...props}
    />
  )
}

// CardDescription 컴포넌트
export function CardDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    />
  )
}

// CardContent 컴포넌트
export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      {...props}
    />
  )
}

// 기본 Card export (optional)
export default Card
