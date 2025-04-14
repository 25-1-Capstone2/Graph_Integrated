"use client";
import Link from "next/link";

export default function GraphBox() {
  return (
    <Link href="/data/graph-123">
      <div style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        height: "500px",
        cursor: "pointer",
      }}>
        <h3>그래프</h3>
      </div>
    </Link>
  );
}


