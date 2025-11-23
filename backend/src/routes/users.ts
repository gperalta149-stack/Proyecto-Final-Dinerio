import { Router, type Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { pool } from '../config/database.js';
import type { AuthRequest } from '../types/index.js';
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
  updateUserSettings
} from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/settings', updateUserSettings);
router.put('/change-password', changePassword);
router.put("/budget", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { monthly_budget } = req.body;
    
    if (monthly_budget === undefined || monthly_budget === null) {
      res.status(400).json({ error: "Monthly budget is required" });
      return;
    }

    const monthlyBudgetNumber = Number(monthly_budget);
    
    if (isNaN(monthlyBudgetNumber) || monthlyBudgetNumber < 0) {
      res.status(400).json({ error: "Monthly budget must be a positive number" });
      return;
    }

    console.log('Actualizando presupuesto:', {
      userId: req.user!.userId,
      newBudget: monthlyBudgetNumber
    });

    const result = await pool.query(
      "UPDATE users SET monthly_budget = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, monthly_budget, currency",
      [monthlyBudgetNumber, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.log('Presupuesto actualizado:', result.rows[0]);
    
    res.json({
      message: "Budget updated successfully",
      user: result.rows[0]
    });
    return;

  } catch (error) {
    console.error("Update budget error:", error);
    res.status(500).json({ error: "Error updating budget" });
    return;
  }
});

router.get('/dashboard', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    console.log('📊 Obteniendo estadísticas del dashboard para usuario:', userId);

    // Obtener suscripciones activas del usuario
    const subscriptionsResult = await pool.query(
      `SELECT 
         amount,
         currency,
         billing_cycle,
         status
       FROM subscriptions 
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    const subscriptions = subscriptionsResult.rows;
    
    // Calcular totales mensuales en ARS
    let monthlyTotalARS = 0;
    let monthlyTotalUSD = 0;
    
    subscriptions.forEach(sub => {
      const amount = parseFloat(sub.amount);
      
      // Convertir a mensual según el ciclo de facturación
      let monthlyAmount = amount;
      switch (sub.billing_cycle) {
        case 'weekly':
          monthlyAmount = amount * 4.33;
          break;
        case 'yearly':
          monthlyAmount = amount / 12;
          break;
        case 'quarterly':
          monthlyAmount = amount / 3;
          break;
      }
      
      // Acumular por moneda
      if (sub.currency === 'USD') {
        monthlyTotalUSD += monthlyAmount;
      } else {
        monthlyTotalARS += monthlyAmount;
      }
    });

    // Obtener tipo de cambio actual (puedes usar una API o valor fijo)
    const exchangeRate = 1020; // Valor por defecto, puedes hacerlo dinámico
    
    // Convertir USD a ARS con impuestos (75%)
    const usdWithTax = monthlyTotalUSD * 1.75;
    const usdInARS = usdWithTax * exchangeRate;
    
    const monthlyTotal = monthlyTotalARS + usdInARS;
    const yearlyTotal = monthlyTotal * 12;
    const totalSubscriptions = subscriptions.length;

    // Obtener presupuesto del usuario
    const userResult = await pool.query(
      "SELECT monthly_budget FROM users WHERE id = $1",
      [userId]
    );

    const monthlyBudget = userResult.rows[0]?.monthly_budget || 0;

    console.log('📈 Estadísticas calculadas con conversión:', {
      monthlyTotalARS,
      monthlyTotalUSD,
      usdInARS,
      monthlyTotal,
      yearlyTotal,
      totalSubscriptions,
      monthlyBudget,
      exchangeRate
    });

    res.json({
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      yearlyTotal: Math.round(yearlyTotal * 100) / 100,
      totalSubscriptions,
      monthlyBudget,
      breakdown: {
        arsSubscriptions: monthlyTotalARS,
        usdSubscriptions: monthlyTotalUSD,
        usdWithTax: usdWithTax,
        exchangeRate: exchangeRate
      }
    });
    return;

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas del dashboard" });
    return;
  }
});

export default router;