import * as React from "react"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={`p-4 border rounded-lg flex items-center gap-2 ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  )
)
Alert.displayName = "Alert"
export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)
