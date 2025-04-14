type FinancialStatement = {
  item: string
  amount: number | null
  year: number
}

export default function FinancialTable({ data }: { data: FinancialStatement[] }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>📊 이월드 (084680) 재무제표</h2>
      <table>
        <thead>
          <tr>
            <th>연도</th>
            <th>항목</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.year}</td>
              <td>{row.item}</td>
              <td>
                {row.amount != null
                  ? row.amount.toLocaleString() + ' 원'
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
