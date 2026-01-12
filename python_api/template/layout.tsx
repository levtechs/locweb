import React from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-yellow-400 text-black text-center py-2 text-sm font-medium">
        Free Website - Custom-Curated by LocWeb
      </div>
      {children}
    </>
  )
}
