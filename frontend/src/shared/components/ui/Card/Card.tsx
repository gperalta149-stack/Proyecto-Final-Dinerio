import type React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className = "", hover = false }) => {
  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-xl p-6 ${hover ? "hover:border-indigo-500 transition-all duration-200" : ""} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
