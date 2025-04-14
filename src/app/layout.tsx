import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body style={{ margin: 0 }}>
        <header></header>
        <main>{children}</main>
        <footer></footer>
      </body>
    </html>
  )
}

export default Layout
