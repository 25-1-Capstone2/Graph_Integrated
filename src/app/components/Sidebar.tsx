"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "200px",
        backgroundColor: "#f0f0f0",
        padding: "16px",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HOME */}
      <Link href="/">
        <div style={{ ...boxStyle, marginBottom: "12px" }}>HOME</div>
      </Link>

      {/* 데이터 리스트: HOME ~ CREATE 사이의 공간 전부 차지 */}
      <div
        style={{
          ...boxStyle,
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        데이터 리스트
      </div>

      {/* CREATE */}
      <div style={{ ...boxStyle, marginTop: "12px" }}>Create</div>
    </aside>
  );
}

const boxStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "12px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  cursor: "pointer",
  textAlign: "center",
  fontWeight: 500,
};



