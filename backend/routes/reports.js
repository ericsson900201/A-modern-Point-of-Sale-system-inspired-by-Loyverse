import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAsync, allAsync } from '../database/db.js';

const router = express.Router();

// Daily summary
router.get('/daily-summary', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const summary = await getAsync(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total_amount) as total_revenue,
        SUM(tax) as total_tax,
        AVG(total_amount) as average_sale
      FROM sales 
      WHERE DATE(created_at) = ?
    `, [today]);
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales by date range
router.get('/sales-range', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    const sales = await allAsync(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        SUM(total_amount) as daily_total,
        SUM(tax) as daily_tax
      FROM sales 
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [startDate, endDate]);
    
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top products
router.get('/top-products', authenticateToken, async (req, res) => {
  try {
    const products = await allAsync(`
      SELECT 
        p.id, p.name, p.sku,
        SUM(si.quantity) as total_quantity,
        SUM(si.subtotal) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY p.id
      ORDER BY total_quantity DESC
      LIMIT 10
    `);
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
