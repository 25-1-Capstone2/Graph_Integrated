import { useState } from 'react'

type Company = {
  code: string
  name: string
  sector: string
}

const ITEMS_PER_PAGE = 10
const PAGE_GROUP_SIZE = 10 // 페이지 버튼 최대 개수

export default function Company({ data }: { data: Company[] }) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const currentItems = data.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  // 페이징 그룹 계산
  const currentGroup = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE)
  const groupStart = currentGroup * PAGE_GROUP_SIZE + 1
  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages)
  const pageNumbers = Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i)

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🏢 상장 기업 목록</h2>

      <table>
        <thead>
          <tr>
            <th>종목코드</th>
            <th>회사명</th>
            <th>업종</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((c, i) => (
            <tr key={i}>
              <td>{c.code}</td>
              <td>{c.name}</td>
              <td>{c.sector}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지 버튼 그룹 */}
      <div style={{ marginTop: '1rem' }}>
        {/* 이전 그룹 버튼 */}
        {groupStart > 1 && (
          <button onClick={() => setCurrentPage(groupStart - 1)} style={{ marginRight: '0.5rem' }}>
            « 이전
          </button>
        )}

        {/* 페이지 번호들 */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              marginRight: '0.3rem',
              fontWeight: currentPage === page ? 'bold' : 'normal',
            }}
          >
            {page}
          </button>
        ))}

        {/* 다음 그룹 버튼 */}
        {groupEnd < totalPages && (
          <button onClick={() => setCurrentPage(groupEnd + 1)} style={{ marginLeft: '0.5rem' }}>
            다음 »
          </button>
        )}
      </div>
    </div>
  )
}
