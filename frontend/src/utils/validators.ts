export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: "La contraseña debe tener al menos 6 caracteres" }
  }
  return { valid: true }
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

export const validateNumber = (value: string | number): boolean => {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return !isNaN(num) && num > 0
}
