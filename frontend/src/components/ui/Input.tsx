import type React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  helperText?: string
}

export const Input: React.FC<InputProps> = ({ label, error, icon, helperText, className = "", ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          className={`w-full px-4 py-2.5 ${icon ? "pl-10" : ""} bg-gray-800 border ${
            error ? "border-red-500" : "border-gray-700"
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${className}`}
          {...props}
        />
      </div>
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-400">{helperText}</p>}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Input