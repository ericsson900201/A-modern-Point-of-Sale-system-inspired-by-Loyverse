import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { runAsync, getAsync, allAsync } from '../database/db.js';

const router = express.Router();

// Get all sales
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sales = await allAsync(`
      SELECT s.*, u.fullname as cashier_name, c.name as customer_name 
      FROM sales s 
      LEFT JOIN users u ON s.user_id = u.id 
      LEFT JOIN customers c ON s.customer_id = c.id 
      ORDER BY s.created_at DESC
    `);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sale details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const sale = await getAsync('SELECT * FROM sales WHERE id = ?', [req.params.id]);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    const items = await allAsync('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id]);
    res.json({ ...sale, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create sale
router.post('/', authenticateToken, async (req, res) => {
  const { customer_id, items, total_amount, tax, discount, payment_method } = req.body;
  
  try {
    const saleResult = await runAsync(
      'INSERT INTO sales (user_id, customer_id, total_amount, tax, discount, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, customer_id || null, total_amount, tax || 0, discount || 0, payment_method]
    );
    
    const saleId = saleResult.id;
    
    // Insert sale items
    for (const item of items) {
      await runAsync(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price, discount, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, item.price, item.discount || 0, item.subtotal]
      );
      
      // Update product quantity
      await runAsync(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Update customer loyalty points if applicable
    if (customer_id) {
      const points = Math.floor(total_amount / 10);
      await runAsync(
        'UPDATE customers SET loyalty_points = loyalty_points + ?, total_spent = total_spent + ? WHERE id = ?',
        [points, total_amount, customer_id]
      );
    }
    
    res.status(201).json({ id: saleId, message: 'Sale created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
