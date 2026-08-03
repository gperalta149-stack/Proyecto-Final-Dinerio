// Validación de email con una expresión simple: formato "usuario@dominio.tld".
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Valida que la contraseña tenga al menos 6 caracteres y devuelve
//   un mensaje en español para mostrarlo en el formulario.
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: "La contraseña debe tener al menos 6 caracteres" }
  }
  return { valid: true }
}

// Comprueba que el campo no esté vacío (trim quita espacios).
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

// Valida números mayores a cero (montos/importes).
export const validateNumber = (value: string | number): boolean => {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return !isNaN(num) && num > 0
}