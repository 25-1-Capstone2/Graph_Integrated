import * as React from "react"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className, ...props }, ref) => (
    <label
      ref={ref}
      className={`block font-medium mb-1 ${className ?? ''}`}
      {...props}
    >
      {children}
    </label>
  )
)
Label.displayName = "Label"
export default Label
