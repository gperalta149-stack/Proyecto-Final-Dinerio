import bcrypt from "bcryptjs"
import crypto from "crypto"
import { Response } from "express"
import jwt from "jsonwebtoken"
import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"

// Se genera token JWT
// Genera el token JWT con jwt.sign: el payload lleva userId, email y nombre.
// La firma usa el secreto JWT_SECRET del entorno y expira según JWT_EXPIRES_IN (default 7 días).
const generateToken = (userId: string, email: string, name?: string): string => {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error("JWT_SECRET no está definido")
  }

  return jwt.sign({ userId, email, name }, jwtSecret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  })
}

// Acá va el registro de usuario
// Registro: valida que el email no exista, hashea la contraseña con bcrypt
// (salt de 10 rondas) y guarda el usuario en la base. Nunca se almacena el password en texto plano.
// Tras insertar, firma un token y devuelve 201 con el usuario y el JWT autenticado.
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, first_name, last_name } = req.body

  try {
    console.log("Register attempt for:", email)

    // Verificar si el usuario ya existe
    const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email])

    if (userExists.rows.length > 0) {
      res.status(400).json({ error: "Email already registered" })
      return
    }

    // Esta parte es el Hash de la contraseña
    // Hash de la contraseña con bcryptjs: se genera un salt aleatorio (10 rondas)
    // y se deriva el hash. Así las contraseñas se guardan de forma segura (one-way).
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const result = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, first_name, last_name, created_at`,
        [email, passwordHash, first_name, last_name],
    )

    const user = result.rows[0]

    const fullName = `${user.first_name} ${user.last_name}`.trim()

    const token = generateToken(user.id, user.email, fullName)

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: fullName,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ error: "Server error during registration" })
  }
}

// Flujo de login: busca el usuario por email, compara el hash con
// bcrypt.compare y, si coincide, firma un JWT nuevo para las próximas peticiones.
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body

  try {
    console.log("Login attempt for:", email)

    const result = await pool.query(
      "SELECT id, email, password, first_name, last_name, monthly_budget FROM users WHERE email = $1",
      [email]
    )

    if (result.rows.length === 0) {
      console.log("User not found")
      res.status(401).json({ error: "Contraseña o Email incorrectos, ingréselo nuevamente" })
      return
    }

    const user = result.rows[0]

    // Crear nombre completo
    const fullName = `${user.first_name} ${user.last_name}`.trim()

    console.log("User found:", {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    })

    // Verificar que la contraseña existe
    if (!user.password) {
      console.error("ERROR: Password is undefined")
      res.status(500).json({ error: "Server configuration error" })
      return
    }

    // Verificar contraseña
    console.log("Comparing passwords...")
    // bcrypt.compare verifica el password ingresado contra el hash almacenado.
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      console.log("Invalid password")
      res.status(401).json({ error: "Contraseña o Email incorrectos, ingréselo nuevamente" })
      return
    }

    console.log("Login successful")
    const token = generateToken(user.id, user.email, fullName)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: fullName,
        monthlyBudget: user.monthly_budget,
      },
    })
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    res.status(500).json({
      error: "Server error during login",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

// Obtener perfil del usuario
// Perfil: consulta al usuario autenticado por req.user.userId (inyectado por el middleware JWT).
// No devuelve la contraseña: solo datos seguros (email, nombre, presupuesto, fechas).
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: "Usuario no autenticado" })
      return
    }

    const result = await pool.query(
      `SELECT id, email, first_name, last_name, monthly_budget, created_at
        FROM users WHERE id = $1`,
      [req.user.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" })
      return
    }

    const user = result.rows[0]
    const fullName = `${user.first_name} ${user.last_name}`.trim()

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: fullName,
        monthlyBudget: user.monthly_budget,
      }
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Actualiza solo el presupuesto mensual del usuario autenticado (UPDATE filtrado por id).
export const updateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  const { monthlyBudget } = req.body

  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: "Usuario no autenticado" })
      return
    }

    const result = await pool.query(
      "UPDATE users SET monthly_budget = $1 WHERE id = $2 RETURNING monthly_budget",
      [monthlyBudget, req.user.userId]
    )

    res.json({
      message: "Budget updated successfully",
      monthlyBudget: result.rows[0].monthly_budget,
    })
  } catch (error) {
    console.error("Update budget error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Reset de contraseña: genera un token aleatorio (crypto.randomBytes, 32 bytes)
// con expiración de 1 hora y lo guarda en password_reset_tokens. Respuesta idéntica exista o no el email (anti-enumeración).
export const requestPasswordReset = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body

  try {
    const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      res.json({ message: "If the email exists, a reset link will be sent" })
      return
    }

    const userId = userResult.rows[0].id
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 3600000)

    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt]
    )

    console.log(`Password reset token for ${email}: ${token}`)
    res.json({ message: "If the email exists, a reset link will be sent" })
  } catch (error) {
    console.error("Password reset request error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Disponibilidad de email: consulta si el email ya está registrado
// y devuelve `available` para validar el formulario en tiempo real.
export const checkAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.query

  try {
    let taken = false

    if (email) {
      const result = await pool.query("SELECT id FROM users WHERE email = $1", [email])
      taken = result.rows.length > 0
    }

    res.json({ available: !taken, taken })
  } catch (error) {
    console.error("Check availability error:", error)
    res.status(500).json({ error: "Server error" })
  }
}